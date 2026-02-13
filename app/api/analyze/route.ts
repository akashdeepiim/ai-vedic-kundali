
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { chartData } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OpenAI API Key missing' }, { status: 500 });
        }

        const systemPrompt = `You are an expert Vedic Astrologer with deep knowledge of Parashara Hora Sastra and Jaimini Sutras. 
        Analyze the provided birth chart data (Planets in Signs, Houses, Nakshatras, Ascendant, Dasha).
        
        Provide a HIGHLY DETAILED, ACCURATE, and SPECIFIC output. 
        CRITICAL: 
        1. YOU MUST PROVIDE SPECIFIC TIME FRAMES (e.g., "From March 2026 to August 2026") for all predictions. 
        2. Base your analysis on specific Planetary Transits (Gochar - Saturn, Jupiter, Rahu/Ketu) and Vimshottari Dasha periods. 
        3. Avoid generic statements. Be precise.
        4. OUTPUT FORMAT: A flat JSON object where EVERY value is a STRING (formatted with Markdown). DO NOT return nested objects.
        
        Output strictly as valid JSON:
        {
            "preliminary": "Deep analysis of personality...",
            "career": "In-depth career forecast with TIME FRAMES...",
            "love": "Detailed relationship analysis with DATES...",
            "marriage": "Conclusive marriage analysis with TIMING...",
            "today": "Precise daily outlook...",
            "week": "Weekly forecast...",
            "month": "Monthly overview...",
            "year": "Comprehensive yearly projection broken down by quarters. MUST BE A SINGLE STRING."
        }

        Tone: Professional, Authoritative অথচ Empathetic. Use clear, accessible language.
        Length: Extensive. Each section must be 3-4 detailed paragraphs.
        
        Current Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. 
        Base all 'Yearly' and 'Future' predictions starting from this date.
        
        CRITICAL DATE CONSTRAINTS:
        - Focus predictions primarily on the next 5-15 years (e.g., 2026-2040).
        - DO NOT generate predictions for dates beyond 2050 unless specifically discussing longevity or distant spiritual milestones.
        - Ensure "Yearly Projections" starts specifically with the current year (2026).

        ADDITIONAL FORMAT REQUIREMENT:
        Include a "timeline" key with a list of 5-7 Major Life Events expected in the next 15 years.
        Format:
        "timeline": [
            { "year": "2027", "title": "Career Rise", "description": "Detailed explanation of why..." },
            { "year": "2029", "title": "Relocation", "description": "Analysis of change in residence..." }
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
                { role: "user", content: JSON.stringify(chartData) }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        return NextResponse.json(JSON.parse(content));

    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json({
            error: 'Failed to generate analysis',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
