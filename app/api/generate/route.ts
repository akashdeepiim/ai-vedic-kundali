import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateKundali } from '@/lib/astrology/calculator';
import { BirthDetails } from '@/lib/astrology/types';

const BirthDetailsSchema = z.object({
    name: z.string().trim().max(120).optional(),
    city: z.string().trim().max(120).optional(),
    country: z.string().trim().max(120).optional(),
    dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    timeString: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
    lat: z.coerce.number().finite().min(-90).max(90),
    lon: z.coerce.number().finite().min(-180).max(180),
    timezone: z.coerce.number().finite().min(-14).max(14),
    timeZoneId: z.string().trim().max(100).optional(),
}).superRefine((value, ctx) => {
    const [year, month, day] = value.dateString.split('-').map(Number);
    const [hour, minute] = value.timeString.split(':').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day ||
        hour > 23 ||
        minute > 59
    ) {
        ctx.addIssue({
            code: 'custom',
            path: ['dateString'],
            message: 'Birth date/time is not a valid calendar moment',
        });
    }

    if (value.timeZoneId) {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: value.timeZoneId });
        } catch {
            ctx.addIssue({
                code: 'custom',
                path: ['timeZoneId'],
                message: 'Unknown IANA timezone',
            });
        }
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = BirthDetailsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Invalid birth details',
                details: parsed.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            }, { status: 400 });
        }

        const input: BirthDetails = parsed.data;

        const result = calculateKundali(input);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error generating kundali:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
