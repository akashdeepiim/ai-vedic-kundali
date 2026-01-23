import { NextResponse } from 'next/server';
import { calculateKundali } from '@/lib/astrology/calculator';
import { BirthDetails } from '@/lib/astrology/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { dateString, timeString, lat, lon, timezone } = body;

        if (!dateString || !timeString || lat === undefined || lon === undefined || timezone === undefined) {
            return NextResponse.json({ error: 'Missing required birth details' }, { status: 400 });
        }

        const input: BirthDetails = {
            dateString,
            timeString,
            lat: Number(lat),
            lon: Number(lon),
            timezone: Number(timezone)
        };

        const result = calculateKundali(input);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error generating kundali:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
