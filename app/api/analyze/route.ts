
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

        const systemPrompt = `You are an expert Vedic Astrologer. 
        Analyze the provided birth chart data (Planets in Signs, Houses, Nakshatras, Ascendant, Dasha).
        
        Provide a detailed output in specific sections. The output should be strictly valid JSON with the following structure:
        {
            "preliminary": "Summary of personality, core strength, and life path.",
            "today": "Outlook for today based on general moon transit or intuition.",
            "week": "Outlook for this week.",
            "month": "Outlook for this month.",
            "year": "Outlook for this year (focus on Dasha/major transits)."
        }

        Tone: Professional, Empathetic, Positive but Realistic, Layman-friendly (avoid excessive jargon without explanation).
        Length: Each section should be substantial (2-3 paragraphs for preliminary, 1-2 paragraphs for timelines).
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(chartData) }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        return NextResponse.json(JSON.parse(content));

    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }
}
