import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Zod Schema for Input Validation
const ChartDataSchema = z.object({
    dateString: z.string(),
    timeString: z.string(),
    lat: z.number(),
    lng: z.number(),
    timezone: z.number(),
    chartData: z.any() // Adjust this if you have a stricter structure for chartData components
}).passthrough(); // Allow other properties if chartData structure is dynamic but validate basics

// Simple In-Memory Rate Limiter (Note: For production at scale, use Redis/Vercel KV)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute per IP

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > RATE_LIMIT_WINDOW) {
        record.count = 0;
        record.lastReset = now;
    }

    if (record.count >= MAX_REQUESTS) {
        return true;
    }

    record.count++;
    rateLimitMap.set(ip, record);
    return false;
}

export async function POST(request: Request) {
    try {
        // 1. Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // 2. Input Validation
        const body = await request.json();
        // Since original code destructured { chartData }, we validate that wrapper or the inner data
        // The previous code did: const { chartData } = await request.json();
        // So we expect body to have chartData.

        if (!body.chartData) {
            return NextResponse.json({ error: 'Missing chartData' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API Key missing on server');
            return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
        }

        const systemPrompt = `You are an expert Vedic Astrologer with deep knowledge of Parashara Hora Sastra and Jaimini Sutras. 
        Analyze the provided birth chart data (Planets in Signs, Houses, Nakshatras, Ascendant, Dasha).
        
        Provide a HIGHLY DETAILED, ACCURATE, and SPECIFIC output. 
        CRITICAL: 
        1. YOU MUST PROVIDE SPECIFIC TIME FRAMES (e.g., "From March 2026 to August 2026") for all predictions. 
        2. Base your analysis on specific Planetary Transits (Gochar - Saturn, Jupiter, Rahu/Ketu) and Vimshottari Dasha periods. 
        3. Avoid generic statements. Be precise.
        4. OUTPUT FORMAT: A flat JSON object where EVERY value is a STRING (formatted with Markdown), except for timelines which are arrays.
        
        Output strictly as valid JSON:
        {
            "preliminary": "Deep analysis of personality...",
            "career": "In-depth career forecast with TIME FRAMES...",
            "health": "Detailed health analysis pointing out potential weak areas or periods of concern...",
            "wealth": "Financial outlook, wealth accumulation potential, and periods of gain/loss...",
            "passion": "Analysis of creative pursuits, hobbies, and areas of deep interest...",
            "family": "Insights into family life, relationship with parents/siblings, and domestic harmony...",
            "love": "Detailed relationship analysis with DATES...",
            "marriage": "Conclusive marriage analysis with TIMING...",
            "today": "Precise daily outlook...",
            "week": "Weekly forecast...",
            "month": "Monthly overview...",
            "year": "Comprehensive yearly projection broken down by quarters. MUST BE A SINGLE STRING."
        }

        Tone: Professional, Authoritative yet Empathetic. Use clear, accessible language.
        Length: Extensive. Each section must be 3-4 detailed paragraphs.
        
        Current Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. 
        Base all 'Yearly' and 'Future' predictions starting from this date.
        
        CRITICAL DATE CONSTRAINTS:
        - Focus predictions primarily on the next 5-15 years (e.g., 2026-2040).
        - DO NOT generate predictions for dates beyond 2050 unless specifically discussing longevity or distant spiritual milestones.
        - Ensure "Yearly Projections" starts specifically with the current year (2026).

        ADDITIONAL FORMAT REQUIREMENTS:

        1. Future Timeline:
        Include a "timeline" key with a list of 5-7 Major Life Events expected in the next 15 years.
        Format:
        "timeline": [
            { "year": "2027", "title": "Career Rise", "description": "Detailed explanation of why..." },
            { "year": "2029", "title": "Relocation", "description": "Analysis of change in residence..." }
        ]

        2. Past Significant Events:
        Include a "past_timeline" key with a list of 3-5 Major Life Events that likely happened in the last 5-10 years based on Dasha/Transits.
        Format:
        "past_timeline": [
            { "year": "2023", "title": "Job Change", "description": "Likely period of change due to..." }
        ]
        
        CONSISTENCY RULE:
        - Use standard Planetary Karakas (Significators) STRICTLY. 
        - For Career: Saturn & 10th House. 
        - For Marriage: Venus/Jupiter & 7th House.
        - Do not halluncinate planetary positions. Use the provided data faithfully.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(body.chartData) }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        return NextResponse.json(JSON.parse(content));

    } catch (error: any) {
        // 3. Secure Error Handling (Don't leak stack traces to client)
        console.error('Analysis error:', error);

        // Return generic error message to client
        return NextResponse.json({
            error: 'An unexpected error occurred during analysis.',
        }, { status: 500 });
    }
}
