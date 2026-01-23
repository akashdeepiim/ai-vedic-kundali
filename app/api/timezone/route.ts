
import { NextResponse } from 'next/server';
import tzlookup from 'tz-lookup';

export async function POST(request: Request) {
    try {
        const { lat, lon, dateString, timeString } = await request.json();

        if (!lat || !lon) {
            return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
        }

        // Get Timezone ID (e.g. "Asia/Kolkata")
        const timeZoneId = tzlookup(Number(lat), Number(lon));

        // Create a date object for the specific time in that timezone
        // We use the provided date/time strings or fallback to now
        let date;
        if (dateString && timeString) {
            date = new Date(`${dateString}T${timeString}:00`);
        } else if (dateString) {
            date = new Date(dateString);
        } else {
            date = new Date();
        }

        // Calculate Offset
        // We can use Intl.DateTimeFormat to get the offset string for that specific date in that timezone
        // The format "GMT+5:30" or "GMT-5" is what we want to parse, or better, getting minutes

        // Strategy: Get the UTC string and the locale string, compare? 
        // Or simpler: Use standard JS getThinking...

        // Actually, easiest robust way without Moment/Luxon:
        // Create date in target timezone and UTC, compare timestamps? No, timestamp is same.
        // Compare "formatted" strings.

        const strInTz = date.toLocaleString('en-US', { timeZone: timeZoneId });
        const dateInTz = new Date(strInTz);

        // This 'dateInTz' has the values of the target timezone but is created as a "local system" or "UTC" object?
        // This approach handles offsets tricky. 

        // Better: Use Intl.DateTimeFormat with 'timeZoneName: "longOffset"' (e.g. "GMT-05:00")
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZoneId,
            timeZoneName: 'longOffset'
        });

        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find(p => p.type === 'timeZoneName');

        let offset = 0;
        if (offsetPart) {
            // value is like "GMT-05:00" or "GMT+05:30"
            const val = offsetPart.value.replace('GMT', '');
            // format is ±HH:mm
            const sign = val.includes('-') ? -1 : 1;
            const [h, m] = val.replace('+', '').replace('-', '').split(':').map(Number);
            offset = sign * (h + (m || 0) / 60);
        }

        return NextResponse.json({
            timeZoneId,
            offset, // number e.g. 5.5 or -5
            formatted: offsetPart?.value
        });

    } catch (error: any) {
        console.error('Timezone error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get timezone' }, { status: 500 });
    }
}
