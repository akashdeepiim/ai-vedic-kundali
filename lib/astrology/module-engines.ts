import { OptionalFeature } from '@/lib/analysis-options';
import { calculateKundali } from '@/lib/astrology/calculator';
import { BirthDetails, KundaliResult, PlanetName, PlanetPosition, ZodiacSign } from '@/lib/astrology/types';
import { getZodiacSign, normalizeDegree, ZODIAC_SIGNS } from '@/lib/astrology/utils';

type Severity = 'low' | 'moderate' | 'high';

export interface ModuleInsight {
    title: string;
    status: 'favorable' | 'neutral' | 'caution' | 'unsupported';
    detail: string;
}

export interface ModuleScore {
    label: string;
    score: number;
    max: number;
    detail: string;
}

export interface ModuleCalculationResult {
    module: OptionalFeature;
    title: string;
    summary: string;
    score?: ModuleScore;
    scores?: ModuleScore[];
    insights: ModuleInsight[];
    calculationDetails: string[];
    limitations: string[];
    nextSteps: string[];
    generatedAt: string;
}

const BENEFIC_PLANETS: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const MALEFIC_PLANETS: PlanetName[] = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];
const CLASSICAL_PLANETS: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const GANA_BY_NAKSHATRA = [
    'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa',
    'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa',
    'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva',
] as const;

const NADI_BY_NAKSHATRA = [
    'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya',
    'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya',
    'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya', 'Adi', 'Madhya', 'Antya',
] as const;

const YONI_BY_NAKSHATRA = [
    'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog', 'Cat', 'Sheep', 'Cat',
    'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',
    'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant',
] as const;

const VASHYA_BY_SIGN: Record<ZodiacSign, string> = {
    Aries: 'Chatushpada',
    Taurus: 'Chatushpada',
    Gemini: 'Nara',
    Cancer: 'Jalachara',
    Leo: 'Vanachara',
    Virgo: 'Nara',
    Libra: 'Nara',
    Scorpio: 'Keeta',
    Sagittarius: 'Chatushpada',
    Capricorn: 'Chatushpada',
    Aquarius: 'Nara',
    Pisces: 'Jalachara',
};

const VARNA_BY_SIGN: Record<ZodiacSign, number> = {
    Cancer: 4,
    Scorpio: 4,
    Pisces: 4,
    Aries: 3,
    Leo: 3,
    Sagittarius: 3,
    Taurus: 2,
    Virgo: 2,
    Capricorn: 2,
    Gemini: 1,
    Libra: 1,
    Aquarius: 1,
};

const FRIENDSHIP: Partial<Record<PlanetName, Partial<Record<PlanetName, number>>>> = {
    Sun: { Moon: 1, Mars: 1, Jupiter: 1, Mercury: 0, Venus: -1, Saturn: -1 },
    Moon: { Sun: 1, Mercury: 1, Mars: 0, Jupiter: 0, Venus: 0, Saturn: 0 },
    Mars: { Sun: 1, Moon: 1, Jupiter: 1, Venus: 0, Saturn: 0, Mercury: -1 },
    Mercury: { Sun: 1, Venus: 1, Mars: 0, Jupiter: 0, Saturn: 0, Moon: -1 },
    Jupiter: { Sun: 1, Moon: 1, Mars: 1, Saturn: 0, Mercury: -1, Venus: -1 },
    Venus: { Mercury: 1, Saturn: 1, Mars: 0, Jupiter: 0, Sun: -1, Moon: -1 },
    Saturn: { Mercury: 1, Venus: 1, Jupiter: 0, Sun: -1, Moon: -1, Mars: -1 },
};

const TITHI_NAMES = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
];

const YOGA_NAMES = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola',
    'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana',
    'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
];

function nowIso() {
    return new Date().toISOString();
}

function numeric(input: Record<string, string>, key: string): number {
    const value = Number(input[key]);
    if (!Number.isFinite(value)) {
        throw new Error(`${key} must be a valid number`);
    }
    return value;
}

function birthDetailsFromInputs(input: Record<string, string>, prefix: string): BirthDetails {
    return {
        name: input[`${prefix}_name`] || undefined,
        city: input[`${prefix}_city`] || undefined,
        country: input[`${prefix}_country`] || undefined,
        dateString: input[`${prefix}_date`],
        timeString: input[`${prefix}_time`],
        lat: numeric(input, `${prefix}_lat`),
        lon: numeric(input, `${prefix}_lon`),
        timezone: numeric(input, `${prefix}_timezone`),
        timeZoneId: input[`${prefix}_timezone_id`] || undefined,
    };
}

function planet(chart: KundaliResult, name: PlanetName): PlanetPosition {
    const found = name === 'Ascendant' ? chart.ascendant : chart.planets.find(p => p.name === name);
    if (!found) throw new Error(`Missing planet ${name}`);
    return found;
}

function houseLord(chart: KundaliResult, house: number): PlanetName {
    return chart.houses[house].signOwner;
}

function houseDistance(from: number, to: number) {
    return (to - from + 12) % 12 + 1;
}

function nakshatraIndex(longitude: number) {
    return Math.floor(normalizeDegree(longitude) / (360 / 27));
}

function signIndex(sign: ZodiacSign) {
    return ZODIAC_SIGNS.indexOf(sign);
}

function relationScore(a: PlanetName, b: PlanetName) {
    if (a === b) return 1;
    const ab = FRIENDSHIP[a]?.[b] ?? 0;
    const ba = FRIENDSHIP[b]?.[a] ?? 0;
    return ab + ba;
}

function scoreStatus(score: number, max: number): 'favorable' | 'neutral' | 'caution' {
    const pct = score / max;
    if (pct >= 0.72) return 'favorable';
    if (pct >= 0.5) return 'neutral';
    return 'caution';
}

function severityStatus(severity: Severity): 'favorable' | 'neutral' | 'caution' {
    if (severity === 'high') return 'caution';
    if (severity === 'moderate') return 'neutral';
    return 'favorable';
}

function dignityPoints(p: PlanetPosition) {
    if (p.dignity === 'Exalted') return 100;
    if (p.dignity === 'Mooltrikona') return 88;
    if (p.dignity === 'Own Sign') return 82;
    if (p.dignity === 'Friendly') return 66;
    if (p.dignity === 'Neutral') return 52;
    if (p.dignity === 'Enemy') return 36;
    if (p.dignity === 'Debilitated') return 20;
    return 50;
}

function beneficMaleficAdjustment(chart: KundaliResult, house: number) {
    const occupants = chart.planets.filter(p => p.house === house && CLASSICAL_PLANETS.includes(p.name));
    const benefic = occupants.filter(p => BENEFIC_PLANETS.includes(p.name)).length;
    const malefic = occupants.filter(p => MALEFIC_PLANETS.includes(p.name)).length;
    return (benefic * 8) - (malefic * 7);
}

function boundedScore(score: number) {
    return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateAshtakoota(native: KundaliResult, partner: KundaliResult): { scores: ModuleScore[]; total: number } {
    const nMoon = planet(native, 'Moon');
    const pMoon = planet(partner, 'Moon');
    const nNak = nakshatraIndex(nMoon.longitude);
    const pNak = nakshatraIndex(pMoon.longitude);
    const nSign = nMoon.sign;
    const pSign = pMoon.sign;
    const nLord = getZodiacSign(nMoon.longitude).lord;
    const pLord = getZodiacSign(pMoon.longitude).lord;

    const varna = VARNA_BY_SIGN[pSign] >= VARNA_BY_SIGN[nSign] ? 1 : 0;
    const vashya = VASHYA_BY_SIGN[nSign] === VASHYA_BY_SIGN[pSign] ? 2 : (signIndex(nSign) === signIndex(pSign) ? 1 : 0.5);
    const taraForward = ((pNak - nNak + 27) % 9) + 1;
    const taraReverse = ((nNak - pNak + 27) % 9) + 1;
    const taraBad = [3, 5, 7];
    const tara = (!taraBad.includes(taraForward) && !taraBad.includes(taraReverse)) ? 3 : (taraBad.includes(taraForward) && taraBad.includes(taraReverse) ? 0 : 1.5);
    const yoni = YONI_BY_NAKSHATRA[nNak] === YONI_BY_NAKSHATRA[pNak] ? 4 : 2;
    const grahaRaw = relationScore(nLord, pLord);
    const graha = grahaRaw >= 2 ? 5 : grahaRaw >= 0 ? 3 : 1;
    const gana = GANA_BY_NAKSHATRA[nNak] === GANA_BY_NAKSHATRA[pNak] ? 6 : (
        GANA_BY_NAKSHATRA[nNak] === 'Rakshasa' || GANA_BY_NAKSHATRA[pNak] === 'Rakshasa' ? 1 : 4
    );
    const signDistance = houseDistance(signIndex(nSign) + 1, signIndex(pSign) + 1);
    const bhakootBad = [2, 6, 8, 12].includes(signDistance);
    const bhakoot = bhakootBad ? 0 : 7;
    const nadi = NADI_BY_NAKSHATRA[nNak] === NADI_BY_NAKSHATRA[pNak] ? 0 : 8;

    const scores: ModuleScore[] = [
        { label: 'Varna', score: varna, max: 1, detail: `Moon signs: ${nSign} and ${pSign}.` },
        { label: 'Vashya', score: vashya, max: 2, detail: `${VASHYA_BY_SIGN[nSign]} vs ${VASHYA_BY_SIGN[pSign]}.` },
        { label: 'Tara', score: tara, max: 3, detail: `Nakshatra distance checks: ${taraForward} and ${taraReverse}.` },
        { label: 'Yoni', score: yoni, max: 4, detail: `${YONI_BY_NAKSHATRA[nNak]} vs ${YONI_BY_NAKSHATRA[pNak]}.` },
        { label: 'Graha Maitri', score: graha, max: 5, detail: `Moon sign lords: ${nLord} and ${pLord}.` },
        { label: 'Gana', score: gana, max: 6, detail: `${GANA_BY_NAKSHATRA[nNak]} vs ${GANA_BY_NAKSHATRA[pNak]}.` },
        { label: 'Bhakoot', score: bhakoot, max: 7, detail: `Moon-sign distance is ${signDistance}; ${bhakootBad ? 'requires caution' : 'acceptable'}.` },
        { label: 'Nadi', score: nadi, max: 8, detail: `${NADI_BY_NAKSHATRA[nNak]} vs ${NADI_BY_NAKSHATRA[pNak]}.` },
    ];

    return { scores, total: scores.reduce((sum, item) => sum + item.score, 0) };
}

function manglikHousesFrom(chart: KundaliResult, referenceHouse: number) {
    const mars = planet(chart, 'Mars');
    const relativeHouse = houseDistance(referenceHouse, mars.house);
    const trigger = [1, 2, 4, 7, 8, 12].includes(relativeHouse);
    return { trigger, relativeHouse };
}

function manglikSummary(chart: KundaliResult): { severity: Severity; detail: string } {
    const asc = manglikHousesFrom(chart, 1);
    const moon = manglikHousesFrom(chart, planet(chart, 'Moon').house);
    const venus = manglikHousesFrom(chart, planet(chart, 'Venus').house);
    const hits = [asc, moon, venus].filter(item => item.trigger).length;
    const severity: Severity = hits >= 2 ? 'high' : hits === 1 ? 'moderate' : 'low';
    return {
        severity,
        detail: `Mars relative houses: Lagna ${asc.relativeHouse}, Moon ${moon.relativeHouse}, Venus ${venus.relativeHouse}.`,
    };
}

function calculateKundliMatching(input: Record<string, string>): ModuleCalculationResult {
    const native = calculateKundali(birthDetailsFromInputs(input, 'native'));
    const partner = calculateKundali(birthDetailsFromInputs(input, 'partner'));
    const ashtakoota = calculateAshtakoota(native, partner);
    const nativeManglik = manglikSummary(native);
    const partnerManglik = manglikSummary(partner);
    const manglikCompatible = nativeManglik.severity === partnerManglik.severity || nativeManglik.severity === 'low' || partnerManglik.severity === 'low';

    return {
        module: 'kundli_matching',
        title: 'Kundli Matching Result',
        summary: `Ashtakoota score is ${ashtakoota.total.toFixed(1)} / 36. ${ashtakoota.total >= 24 ? 'The classical compatibility baseline is strong.' : ashtakoota.total >= 18 ? 'The match is workable but needs area-specific review.' : 'The score asks for caution and deeper review before relying on the match.'}`,
        score: { label: 'Total Ashtakoota', score: Number(ashtakoota.total.toFixed(1)), max: 36, detail: 'Classical 8-factor Moon-based compatibility score.' },
        scores: ashtakoota.scores,
        insights: [
            { title: 'Compatibility Band', status: scoreStatus(ashtakoota.total, 36), detail: `${ashtakoota.total.toFixed(1)} / 36 is ${ashtakoota.total >= 24 ? 'generally supportive' : ashtakoota.total >= 18 ? 'mixed but usable with counselling and family context' : 'below the common screening threshold'}.` },
            { title: 'Manglik Cross-check', status: manglikCompatible ? 'neutral' : 'caution', detail: `Native: ${nativeManglik.severity} (${nativeManglik.detail}) Partner: ${partnerManglik.severity} (${partnerManglik.detail}).` },
            { title: 'Market-standard Caveat', status: 'neutral', detail: 'This is a deterministic Ashtakoota and Manglik screen. Final compatibility should also review both complete charts, D9, dasha timing, and lived context.' },
        ],
        calculationDetails: [
            `Native Moon: ${planet(native, 'Moon').nakshatra}, ${planet(native, 'Moon').sign}.`,
            `Partner Moon: ${planet(partner, 'Moon').nakshatra}, ${planet(partner, 'Moon').sign}.`,
            'Scoring uses Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi.',
        ],
        limitations: [
            'Ashtakoota is Moon-based and does not replace full chart synthesis.',
            'Regional exceptions and family tradition rules can change final judgement.',
        ],
        nextSteps: [
            'Review low-scoring kootas first instead of relying only on total score.',
            'Compare D9 and current dashas for marriage timing and relationship stress windows.',
        ],
        generatedAt: nowIso(),
    };
}

function localNoon(dateString: string, timezone: number) {
    return `${dateString}T12:00:00${timezone >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(timezone))).padStart(2, '0')}:${String(Math.round((Math.abs(timezone) % 1) * 60)).padStart(2, '0')}`;
}

function panchangForDate(input: Record<string, string>, dateString: string): { score: number; lines: string[]; cautions: string[] } {
    const event = calculateKundali({
        dateString,
        timeString: input.event_time || '12:00',
        lat: numeric(input, 'event_lat'),
        lon: numeric(input, 'event_lon'),
        timezone: numeric(input, 'event_timezone'),
        city: input.event_city || undefined,
        country: input.event_country || undefined,
    });
    const moon = planet(event, 'Moon');
    const sun = planet(event, 'Sun');
    const diff = normalizeDegree(moon.longitude - sun.longitude);
    const tithiIndex = Math.floor(diff / 12);
    const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
    const tithiName = TITHI_NAMES[tithiIndex % 15];
    const yogaIndex = Math.floor(normalizeDegree(moon.longitude + sun.longitude) / (360 / 27));
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(localNoon(dateString, numeric(input, 'event_timezone'))));
    const cautions: string[] = [];
    let score = 70;
    if ([3, 8, 13].includes(tithiIndex % 15)) {
        score -= 18;
        cautions.push(`${tithiName} is often treated cautiously for auspicious starts.`);
    }
    if (['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Magha', 'Jyeshtha', 'Mula'].includes(moon.nakshatra)) {
        score -= 14;
        cautions.push(`${moon.nakshatra} may be unsuitable for some auspicious activities.`);
    }
    if (['Sukarma', 'Dhriti', 'Shubha', 'Siddha', 'Saubhagya'].includes(YOGA_NAMES[yogaIndex])) score += 10;
    if (weekday === 'Thursday' || weekday === 'Friday' || weekday === 'Wednesday') score += 5;

    return {
        score: boundedScore(score),
        lines: [
            `${weekday}: ${paksha} ${tithiName}`,
            `Moon nakshatra: ${moon.nakshatra} pada ${moon.pada}`,
            `Yoga: ${YOGA_NAMES[yogaIndex]}`,
        ],
        cautions,
    };
}

function eachDate(start: string, end: string): string[] {
    const startDate = new Date(`${start}T00:00:00Z`);
    const endDate = new Date(`${end}T00:00:00Z`);
    const days: string[] = [];
    for (let t = startDate.getTime(); t <= endDate.getTime() && days.length < 31; t += 86400000) {
        days.push(new Date(t).toISOString().slice(0, 10));
    }
    return days;
}

function calculatePanchangMuhurat(input: Record<string, string>): ModuleCalculationResult {
    const dates = eachDate(input.start_date, input.end_date);
    const evaluated = dates.map(date => ({ date, ...panchangForDate(input, date) })).sort((a, b) => b.score - a.score);
    const best = evaluated[0];

    return {
        module: 'panchang_muhurta',
        title: 'Panchang & Muhurat Screening',
        summary: best ? `Best screened date in the selected window is ${best.date} with a ${best.score}/100 auspiciousness score.` : 'No date could be evaluated.',
        score: best ? { label: 'Best Date Score', score: best.score, max: 100, detail: best.lines.join(' | ') } : undefined,
        scores: evaluated.slice(0, 7).map(item => ({ label: item.date, score: item.score, max: 100, detail: item.lines.join(' | ') })),
        insights: best ? [
            { title: 'Recommended Candidate', status: scoreStatus(best.score, 100), detail: `${best.date}: ${best.lines.join('; ')}.` },
            { title: 'Caution Flags', status: best.cautions.length ? 'caution' : 'favorable', detail: best.cautions.length ? best.cautions.join(' ') : 'No major simplified Panchang cautions were detected for the best candidate.' },
            { title: 'Date Window', status: evaluated.length > 7 ? 'neutral' : 'favorable', detail: `Evaluated ${evaluated.length} day(s). Windows above 31 days are capped for usability.` },
        ] : [],
        calculationDetails: [
            'Computed sidereal Sun and Moon positions for each candidate date.',
            'Derived tithi, paksha, lunar nakshatra, weekday, and yoga.',
            'Scored dates using a conservative suitability screen; it is not a full electional search.',
        ],
        limitations: [
            'This engine does not yet compute exact start/end times of each Panchang limb through the day.',
            'Tarabala, Chandrabala, local sunrise-based lagna windows, and activity-specific regional rules need deeper electional refinement.',
        ],
        nextSteps: [
            'Use the top-ranked dates as candidates, then refine by activity-specific rules and family constraints.',
            'Avoid treating this as a final muhurta for high-stakes rituals without expert review.',
        ],
        generatedAt: nowIso(),
    };
}

function calculateKaalSarp(chart: KundaliResult): { present: boolean; detail: string } {
    const rahu = planet(chart, 'Rahu').longitude;
    const ketu = planet(chart, 'Ketu').longitude;
    const innerPlanets = chart.planets.filter(p => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.name));
    const clockwise = innerPlanets.every(p => normalizeDegree(p.longitude - rahu) <= normalizeDegree(ketu - rahu));
    const reverse = innerPlanets.every(p => normalizeDegree(p.longitude - ketu) <= normalizeDegree(rahu - ketu));
    return {
        present: clockwise || reverse,
        detail: `Classical planets are ${clockwise || reverse ? 'contained' : 'not fully contained'} within one Rahu-Ketu arc.`,
    };
}

function calculateSadeSati(chart: KundaliResult): { active: boolean; phase: string; detail: string } {
    const natalMoonSignIndex = signIndex(planet(chart, 'Moon').sign);
    const transitSaturn = chart.transits.planets.find(p => p.name === 'Saturn');
    if (!transitSaturn) return { active: false, phase: 'Unknown', detail: 'Transit Saturn unavailable.' };
    const saturnSignIndex = signIndex(transitSaturn.sign);
    const distance = houseDistance(natalMoonSignIndex + 1, saturnSignIndex + 1);
    const active = [12, 1, 2].includes(distance);
    const phase = distance === 12 ? 'Rising phase' : distance === 1 ? 'Peak phase' : distance === 2 ? 'Setting phase' : 'Not active';
    return { active, phase, detail: `Transit Saturn is in ${transitSaturn.sign}, ${distance} from natal Moon sign ${planet(chart, 'Moon').sign}.` };
}

function calculateDosha(input: Record<string, string>): ModuleCalculationResult {
    const chart = calculateKundali(birthDetailsFromInputs(input, 'native'));
    const manglik = manglikSummary(chart);
    const kaalSarp = calculateKaalSarp(chart);
    const sadeSati = calculateSadeSati(chart);
    const score = (manglik.severity === 'high' ? 35 : manglik.severity === 'moderate' ? 18 : 4) + (kaalSarp.present ? 30 : 0) + (sadeSati.active ? 20 : 0);

    return {
        module: 'dosha_analysis',
        title: 'Dosha Analysis',
        summary: `Overall dosha pressure is ${score >= 55 ? 'high' : score >= 25 ? 'moderate' : 'low'} based on Manglik, Kaal Sarp, and current Sade Sati screens.`,
        score: { label: 'Dosha Pressure', score: boundedScore(score), max: 100, detail: 'Higher score means more caution flags, not a deterministic outcome.' },
        insights: [
            { title: 'Manglik Screen', status: severityStatus(manglik.severity), detail: `${manglik.severity.toUpperCase()}: ${manglik.detail}` },
            { title: 'Kaal Sarp Screen', status: kaalSarp.present ? 'caution' : 'favorable', detail: kaalSarp.detail },
            { title: 'Sade Sati Screen', status: sadeSati.active ? 'caution' : 'favorable', detail: `${sadeSati.phase}. ${sadeSati.detail}` },
        ],
        calculationDetails: [
            'Manglik checked from Lagna, Moon, and Venus using houses 1, 2, 4, 7, 8, and 12.',
            'Kaal Sarp checks whether classical planets are contained between Rahu and Ketu.',
            'Sade Sati checks current transit Saturn against natal Moon sign.',
        ],
        limitations: [
            'Regional cancellation rules and tradition-specific remedies are not treated as universal.',
            'This is a risk-factor screen, not a deterministic judgement.',
        ],
        nextSteps: [
            'Inspect the relevant life area with dasha and house strength before drawing conclusions.',
            'Use remedy guidance conservatively and avoid fear-based interpretations.',
        ],
        generatedAt: nowIso(),
    };
}

function divisionalSign(longitude: number, division: number): ZodiacSign {
    const signIdx = Math.floor(normalizeDegree(longitude) / 30);
    const part = Math.floor((normalizeDegree(longitude) % 30) / (30 / division));
    return ZODIAC_SIGNS[(signIdx * division + part) % 12];
}

function calculateVarga(input: Record<string, string>): ModuleCalculationResult {
    const chart = calculateKundali(birthDetailsFromInputs(input, 'native'));
    const requested = (input.requested_vargas || 'D10').toUpperCase().match(/D\d+/g) ?? ['D10'];
    const allowed = [2, 3, 7, 10, 12, 16, 24, 30, 60];
    const scores = requested.map(label => {
        const division = Number(label.slice(1));
        if (!allowed.includes(division)) {
            return { label, score: 0, max: 100, detail: 'Unsupported divisional chart request.' };
        }
        const strong = chart.planets.filter(p => CLASSICAL_PLANETS.includes(p.name) && ['Exalted', 'Own Sign', 'Mooltrikona'].includes(p.dignity ?? '')).length;
        const vargaHighlights = chart.planets
            .filter(p => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.name))
            .map(p => `${p.name} ${divisionalSign(p.longitude, division)}`)
            .slice(0, 7)
            .join(', ');
        return { label, score: boundedScore(50 + strong * 6), max: 100, detail: vargaHighlights };
    });

    return {
        module: 'more_varga_charts',
        title: 'Varga Chart Analysis',
        summary: `Generated ${scores.length} divisional chart screen(s): ${scores.map(s => s.label).join(', ')}.`,
        scores,
        insights: scores.map(score => ({ title: score.label, status: score.score >= 65 ? 'favorable' : 'neutral', detail: score.detail })),
        calculationDetails: [
            'Computed requested varga sign placements from sidereal planetary longitude.',
            'Strength score currently combines natal dignity support with divisional sign distribution.',
        ],
        limitations: [
            'This provides deterministic divisional sign placement, not a full tradition-specific varga judgement.',
            'Fine-grained varga dignity, lordship synthesis, and school-specific exceptions should be expanded with golden tests.',
        ],
        nextSteps: [
            'Prioritize D10 for career, D7 for children, D12 for parents, D24 for education, and D60 only with highly reliable birth time.',
            'Cross-check any varga conclusion against D1 and D9 before using it.',
        ],
        generatedAt: nowIso(),
    };
}

function calculateYoga(input: Record<string, string>): ModuleCalculationResult {
    const chart = calculateKundali(birthDetailsFromInputs(input, 'native'));
    const yogas: ModuleInsight[] = [];
    const jupiter = planet(chart, 'Jupiter');
    const moon = planet(chart, 'Moon');
    const kendrasFromMoon = [1, 4, 7, 10].includes(houseDistance(moon.house, jupiter.house));
    yogas.push({ title: 'Gaja Kesari Yoga', status: kendrasFromMoon ? 'favorable' : 'neutral', detail: `Jupiter is ${houseDistance(moon.house, jupiter.house)} from Moon.` });

    [1, 4, 7, 10].forEach(kendra => {
        const lord = houseLord(chart, kendra);
        const lordPlanet = planet(chart, lord);
        if ([1, 5, 9].includes(lordPlanet.house)) {
            yogas.push({ title: 'Raja Yoga Candidate', status: 'favorable', detail: `${kendra}th lord ${lord} occupies trinal house ${lordPlanet.house}.` });
        }
    });

    [2, 11].forEach(wealthHouse => {
        const lord = houseLord(chart, wealthHouse);
        const lordPlanet = planet(chart, lord);
        if ([1, 2, 5, 9, 10, 11].includes(lordPlanet.house)) {
            yogas.push({ title: 'Dhana Yoga Candidate', status: 'favorable', detail: `${wealthHouse}th lord ${lord} supports house ${lordPlanet.house}.` });
        }
    });

    chart.planets.filter(p => p.dignity === 'Debilitated').forEach(p => {
        const dispositor = planet(chart, p.signLord);
        const cancelled = [1, 4, 7, 10].includes(dispositor.house);
        yogas.push({ title: `Neecha Bhanga Check: ${p.name}`, status: cancelled ? 'neutral' : 'caution', detail: `${p.name} is debilitated in ${p.sign}; dispositor ${p.signLord} is in house ${dispositor.house}.` });
    });

    const score = boundedScore(45 + yogas.filter(y => y.status === 'favorable').length * 10 - yogas.filter(y => y.status === 'caution').length * 8);

    return {
        module: 'yoga_detection',
        title: 'Yoga Detection',
        summary: `Detected ${yogas.length} yoga candidates with a ${score}/100 activation screen.`,
        score: { label: 'Yoga Activation Screen', score, max: 100, detail: 'Scores candidate quantity and basic strength, not guaranteed outcomes.' },
        insights: yogas.length ? yogas : [{ title: 'No Major Candidate', status: 'neutral', detail: 'No major rule candidate was detected by this screen.' }],
        calculationDetails: [
            'Checked Gaja Kesari, kendra/trikona Raja Yoga candidates, Dhana Yoga candidates, and Neecha Bhanga conditions.',
            'Uses whole-sign houses and classical planetary lords.',
        ],
        limitations: [
            'Yoga strength depends on dignity, combustion, aspects, dasha activation, and divisional confirmation.',
            'This engine reports candidates, not guaranteed life events.',
        ],
        nextSteps: [
            'Prioritize yogas involving current dasha lords.',
            'Confirm high-value yogas in D9 and relevant vargas before presenting strong conclusions.',
        ],
        generatedAt: nowIso(),
    };
}

function calculateStrength(input: Record<string, string>): ModuleCalculationResult {
    const chart = calculateKundali(birthDetailsFromInputs(input, 'native'));
    const scores = chart.planets
        .filter(p => CLASSICAL_PLANETS.includes(p.name))
        .map(p => {
            const score = boundedScore(dignityPoints(p) + beneficMaleficAdjustment(chart, p.house) + (p.isCombust ? -12 : 0) + (p.isRetrograde ? -4 : 0));
            return {
                label: p.name,
                score,
                max: 100,
                detail: `${p.sign} house ${p.house}, ${p.dignity ?? 'neutral'}, ${p.isCombust ? 'combust' : 'not combust'}, ${p.isRetrograde ? 'retrograde' : 'direct'}.`,
            };
        });
    const average = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
    const weakest = [...scores].sort((a, b) => a.score - b.score)[0];
    const strongest = [...scores].sort((a, b) => b.score - a.score)[0];

    return {
        module: 'shadbala_ashtakavarga',
        title: 'Strength & Ashtakavarga Screen',
        summary: `Overall planetary strength screen is ${average.toFixed(0)}/100. Strongest: ${strongest.label}; weakest: ${weakest.label}.`,
        score: { label: 'Average Strength', score: Number(average.toFixed(0)), max: 100, detail: 'Composite dignity, combustion, retrogression, and house environment screen.' },
        scores,
        insights: [
            { title: 'Strongest Planet', status: 'favorable', detail: `${strongest.label}: ${strongest.detail}` },
            { title: 'Weakest Planet', status: weakest.score < 40 ? 'caution' : 'neutral', detail: `${weakest.label}: ${weakest.detail}` },
            { title: 'Transit Support', status: 'neutral', detail: chart.transits.summary.join(' | ') },
        ],
        calculationDetails: [
            'Computed a deterministic strength screen from dignity, combustion, retrograde state, and house occupants.',
            'Includes current slow-planet transit context from the natal Lagna.',
        ],
        limitations: [
            'This is not full classical Shadbala with all six strength families.',
            'This is not full BAV/SAV Ashtakavarga bindu tabulation yet; it is a production-safe strength screen that does not overclaim.',
        ],
        nextSteps: [
            'Use weak planets as areas for cautious interpretation, not fear-based prediction.',
            'Build full Shadbala and BAV tables as a separate golden-tested engine before exposing exact bindu claims.',
        ],
        generatedAt: nowIso(),
    };
}

export function calculateOptionalModule(module: OptionalFeature, input: Record<string, string>): ModuleCalculationResult {
    if (module === 'kundli_matching') return calculateKundliMatching(input);
    if (module === 'panchang_muhurta') return calculatePanchangMuhurat(input);
    if (module === 'dosha_analysis') return calculateDosha(input);
    if (module === 'more_varga_charts') return calculateVarga(input);
    if (module === 'yoga_detection') return calculateYoga(input);
    if (module === 'shadbala_ashtakavarga') return calculateStrength(input);
    throw new Error(`Unsupported module: ${module}`);
}
