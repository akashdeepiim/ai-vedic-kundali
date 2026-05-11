import { NextResponse } from 'next/server';
import tzlookup from 'tz-lookup';
import { z } from 'zod';

const TimezoneRequestSchema = z.object({
    lat: z.coerce.number().finite().min(-90).max(90),
    lon: z.coerce.number().finite().min(-180).max(180),
    dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    timeString: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

function getOffsetHours(timeZoneId: string, instant: Date): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(instant);
    const partValue = (type: Intl.DateTimeFormatPartTypes) => {
        const value = parts.find(p => p.type === type)?.value;
        if (!value) throw new Error(`Unable to resolve ${type} in ${timeZoneId}`);
        return Number(value);
    };

    const localAsUtc = Date.UTC(
        partValue('year'),
        partValue('month') - 1,
        partValue('day'),
        partValue('hour'),
        partValue('minute'),
        partValue('second')
    );

    return (localAsUtc - instant.getTime()) / 3600000;
}

function getOffsetForLocalWallTime(timeZoneId: string, dateString?: string, timeString?: string): number {
    if (!dateString) return getOffsetHours(timeZoneId, new Date());

    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = (timeString ?? '12:00').split(':').map(Number);
    const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    let guessUtc = localAsUtc - getOffsetHours(timeZoneId, new Date(localAsUtc)) * 3600000;

    for (let i = 0; i < 3; i++) {
        const offset = getOffsetHours(timeZoneId, new Date(guessUtc));
        guessUtc = localAsUtc - offset * 3600000;
    }

    return getOffsetHours(timeZoneId, new Date(guessUtc));
}

export async function POST(request: Request) {
    try {
        const parsed = TimezoneRequestSchema.safeParse(await request.json());

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Invalid timezone lookup input',
                details: parsed.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            }, { status: 400 });
        }

        const { lat, lon, dateString, timeString } = parsed.data;

        // Get Timezone ID (e.g. "Asia/Kolkata")
        const timeZoneId = tzlookup(lat, lon);
        const offset = getOffsetForLocalWallTime(timeZoneId, dateString, timeString);
        const sign = offset < 0 ? '-' : '+';
        const abs = Math.abs(offset);
        const hours = Math.floor(abs).toString().padStart(2, '0');
        const minutes = Math.round((abs % 1) * 60).toString().padStart(2, '0');

        return NextResponse.json({
            timeZoneId,
            offset, // number e.g. 5.5 or -5
            formatted: `GMT${sign}${hours}:${minutes}`
        });

    } catch (error: unknown) {
        console.error('Timezone error:', error);
        const message = error instanceof Error ? error.message : 'Failed to get timezone';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
