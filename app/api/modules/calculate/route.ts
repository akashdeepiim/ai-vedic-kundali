import { NextResponse } from 'next/server';
import tzlookup from 'tz-lookup';
import { z } from 'zod';
import { calculateOptionalModule } from '@/lib/astrology/module-engines';

const OptionalFeatureSchema = z.enum([
    'kundli_matching',
    'panchang_muhurta',
    'dosha_analysis',
    'more_varga_charts',
    'yoga_detection',
    'shadbala_ashtakavarga',
]);

const InputsSchema = z.record(z.string(), z.string().max(1000)).default({});

const ModuleRequestSchema = z.object({
    module: OptionalFeatureSchema,
    inputs: InputsSchema,
});

const dateSchema = /^\d{4}-\d{2}-\d{2}$/;
const timeSchema = /^\d{2}:\d{2}$/;

function addRequiredIssues(inputs: Record<string, string>, required: string[], ctx: z.RefinementCtx) {
    required.forEach(key => {
        if (!inputs[key]?.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['inputs', key],
                message: `${key} is required`,
            });
        }
    });
}

function validateDateTime(inputs: Record<string, string>, dateKey: string, timeKey: string, ctx: z.RefinementCtx) {
    const date = inputs[dateKey];
    const time = inputs[timeKey];
    if (date && !dateSchema.test(date)) {
        ctx.addIssue({ code: 'custom', path: ['inputs', dateKey], message: 'Date must be YYYY-MM-DD' });
    }
    if (time && !timeSchema.test(time)) {
        ctx.addIssue({ code: 'custom', path: ['inputs', timeKey], message: 'Time must be HH:mm' });
    }
}

function getOffsetHours(timeZoneId: string, instant: Date): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(instant);

    const value = (type: Intl.DateTimeFormatPartTypes) => {
        const part = parts.find(p => p.type === type)?.value;
        if (!part) throw new Error(`Unable to resolve ${type} for timezone ${timeZoneId}`);
        return Number(part);
    };

    const localAsUtc = Date.UTC(
        value('year'),
        value('month') - 1,
        value('day'),
        value('hour'),
        value('minute'),
        value('second')
    );

    return (localAsUtc - instant.getTime()) / 3600000;
}

function getOffsetForLocalWallTime(timeZoneId: string, dateString: string, timeString?: string): number {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = (timeString || '12:00').split(':').map(Number);
    const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    let guessUtc = localAsUtc - getOffsetHours(timeZoneId, new Date(localAsUtc)) * 3600000;

    for (let i = 0; i < 3; i++) {
        const offset = getOffsetHours(timeZoneId, new Date(guessUtc));
        guessUtc = localAsUtc - offset * 3600000;
    }

    return getOffsetHours(timeZoneId, new Date(guessUtc));
}

async function resolveLocation(inputs: Record<string, string>, prefix: string, dateKey: string, timeKey: string) {
    const city = inputs[`${prefix}_city`]?.trim();
    const country = inputs[`${prefix}_country`]?.trim();
    if (!city) throw new Error(`${prefix}_city is required`);

    const query = [city, country].filter(Boolean).join(', ');
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'User-Agent': 'VedicAstra/1.0' },
    });
    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first?.lat || !first?.lon) {
        throw new Error(`Could not resolve location for ${query}`);
    }

    const lat = Number(first.lat);
    const lon = Number(first.lon);
    const timeZoneId = tzlookup(lat, lon);
    const offset = getOffsetForLocalWallTime(timeZoneId, inputs[dateKey], inputs[timeKey]);

    return {
        ...inputs,
        [`${prefix}_lat`]: String(lat),
        [`${prefix}_lon`]: String(lon),
        [`${prefix}_timezone`]: String(offset),
        [`${prefix}_timezone_id`]: timeZoneId,
    };
}

async function enrichLocations(module: z.infer<typeof OptionalFeatureSchema>, inputs: Record<string, string>) {
    if (module === 'kundli_matching') {
        const withNative = await resolveLocation(inputs, 'native', 'native_date', 'native_time');
        return resolveLocation(withNative, 'partner', 'partner_date', 'partner_time');
    }

    if (module === 'panchang_muhurta') {
        return resolveLocation(inputs, 'event', 'start_date', 'event_time');
    }

    return resolveLocation(inputs, 'native', 'native_date', 'native_time');
}

const ValidatedModuleRequestSchema = ModuleRequestSchema.superRefine((value, ctx) => {
    const nativeBirth = ['native_date', 'native_time', 'native_city', 'native_country'];
    const partnerBirth = ['partner_date', 'partner_time', 'partner_city', 'partner_country'];

    if (value.module === 'kundli_matching') {
        addRequiredIssues(value.inputs, [...nativeBirth, ...partnerBirth], ctx);
        validateDateTime(value.inputs, 'native_date', 'native_time', ctx);
        validateDateTime(value.inputs, 'partner_date', 'partner_time', ctx);
        return;
    }

    if (value.module === 'panchang_muhurta') {
        addRequiredIssues(value.inputs, ['start_date', 'end_date', 'event_city', 'event_country'], ctx);
        if (value.inputs.start_date && !dateSchema.test(value.inputs.start_date)) {
            ctx.addIssue({ code: 'custom', path: ['inputs', 'start_date'], message: 'Start date must be YYYY-MM-DD' });
        }
        if (value.inputs.end_date && !dateSchema.test(value.inputs.end_date)) {
            ctx.addIssue({ code: 'custom', path: ['inputs', 'end_date'], message: 'End date must be YYYY-MM-DD' });
        }
        if (value.inputs.event_time && !timeSchema.test(value.inputs.event_time)) {
            ctx.addIssue({ code: 'custom', path: ['inputs', 'event_time'], message: 'Event time must be HH:mm' });
        }
        if (value.inputs.start_date && value.inputs.end_date && value.inputs.start_date > value.inputs.end_date) {
            ctx.addIssue({ code: 'custom', path: ['inputs', 'end_date'], message: 'End date must be on or after start date' });
        }
        return;
    }

    addRequiredIssues(value.inputs, nativeBirth, ctx);
    validateDateTime(value.inputs, 'native_date', 'native_time', ctx);
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = ValidatedModuleRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Invalid module input',
                details: parsed.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            }, { status: 400 });
        }

        const enrichedInputs = await enrichLocations(parsed.data.module, parsed.data.inputs);
        const result = calculateOptionalModule(parsed.data.module, enrichedInputs);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Optional module calculation error:', error);
        return NextResponse.json({ error: 'Unable to calculate this module.' }, { status: 500 });
    }
}
