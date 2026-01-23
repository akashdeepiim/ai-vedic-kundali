import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy', // Prevent crash if missing, handle logically below
});

export async function POST(request: Request) {
    try {
        const { chartData, messages } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                role: 'assistant',
                content: "⚠️ OpenAI API Key is missing. Please configure OPENAI_API_KEY in your .env file to enable AI predictions."
            });
        }

        const systemPrompt = `You are an expert Vedic Astrologer (Jyotish).
You have been provided with the following birth chart data:
${JSON.stringify(chartData, null, 2)}

Your task is to answer the user's questions based STRICTLY on this chart.
- Use the provided planetary positions, Dasha, and House data.
- Interpret the results using classical Vedic principles (Parashara, Jaimini).
- Be helpful, empathetic, but realistic. Avoid fatalistic predictions.
- If the answer depends on a chart factor not present (e.g. specific divisional chart nuances not calculated), mention that limitation.
- Format your response in clean Markdown.

Current Dasha: ${JSON.stringify(chartData.dasha.current)}
`;

        // messages is array of { role, content }
        const validMessages = messages.map((m: any) => ({ role: m.role, content: m.content }));

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // or gpt-3.5-turbo if preferred
            messages: [
                { role: "system", content: systemPrompt },
                ...validMessages
            ],
        });

        return NextResponse.json(completion.choices[0].message);

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
    }
}
