import { PlanetName, ZodiacSign, Dignity } from './types';

export const ZODIAC_SIGNS: ZodiacSign[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const PLANET_LORDS: PlanetName[] = [
    'Mars', 'Venus', 'Mercury', 'Moon',
    'Sun', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
]; // Aries -> Pisces lords

export const NAKSHATRAS = [
    { name: 'Ashwini', lord: 'Ketu' },
    { name: 'Bharani', lord: 'Venus' },
    { name: 'Krittika', lord: 'Sun' },
    { name: 'Rohini', lord: 'Moon' },
    { name: 'Mrigashira', lord: 'Mars' },
    { name: 'Ardra', lord: 'Rahu' },
    { name: 'Punarvasu', lord: 'Jupiter' },
    { name: 'Pushya', lord: 'Saturn' },
    { name: 'Ashlesha', lord: 'Mercury' },
    { name: 'Magha', lord: 'Ketu' },
    { name: 'Purva Phalguni', lord: 'Venus' },
    { name: 'Uttara Phalguni', lord: 'Sun' },
    { name: 'Hasta', lord: 'Moon' },
    { name: 'Chitra', lord: 'Mars' },
    { name: 'Swati', lord: 'Rahu' },
    { name: 'Vishakha', lord: 'Jupiter' },
    { name: 'Anuradha', lord: 'Saturn' },
    { name: 'Jyeshtha', lord: 'Mercury' },
    { name: 'Mula', lord: 'Ketu' },
    { name: 'Purva Ashadha', lord: 'Venus' },
    { name: 'Uttara Ashadha', lord: 'Sun' },
    { name: 'Shravana', lord: 'Moon' },
    { name: 'Dhanishta', lord: 'Mars' },
    { name: 'Shatabhisha', lord: 'Rahu' },
    { name: 'Purva Bhadrapada', lord: 'Jupiter' },
    { name: 'Uttara Bhadrapada', lord: 'Saturn' },
    { name: 'Revati', lord: 'Mercury' }
];

// --- Dignity Tables (Parashara) ---

// Exaltation sign and exact degree
const EXALTATION: Partial<Record<PlanetName, { sign: ZodiacSign; degree: number }>> = {
    'Sun':     { sign: 'Aries',      degree: 10 },
    'Moon':    { sign: 'Taurus',     degree: 3 },
    'Mars':    { sign: 'Capricorn',  degree: 28 },
    'Mercury': { sign: 'Virgo',      degree: 15 },
    'Jupiter': { sign: 'Cancer',     degree: 5 },
    'Venus':   { sign: 'Pisces',     degree: 27 },
    'Saturn':  { sign: 'Libra',      degree: 20 },
    'Rahu':    { sign: 'Taurus',     degree: 20 },
    'Ketu':    { sign: 'Scorpio',    degree: 20 },
};

// Debilitation sign (always opposite of exaltation)
const DEBILITATION: Partial<Record<PlanetName, ZodiacSign>> = {
    'Sun':     'Libra',
    'Moon':    'Scorpio',
    'Mars':    'Cancer',
    'Mercury': 'Pisces',
    'Jupiter': 'Capricorn',
    'Venus':   'Virgo',
    'Saturn':  'Aries',
    'Rahu':    'Scorpio',
    'Ketu':    'Taurus',
};

// Own signs (Swakshetra)
const OWN_SIGNS: Partial<Record<PlanetName, ZodiacSign[]>> = {
    'Sun':     ['Leo'],
    'Moon':    ['Cancer'],
    'Mars':    ['Aries', 'Scorpio'],
    'Mercury': ['Gemini', 'Virgo'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Venus':   ['Taurus', 'Libra'],
    'Saturn':  ['Capricorn', 'Aquarius'],
    'Rahu':    ['Aquarius'],
    'Ketu':    ['Scorpio'],
};

// Mooltrikona sign and degree range
const MOOLTRIKONA: Partial<Record<PlanetName, { sign: ZodiacSign; startDeg: number; endDeg: number }>> = {
    'Sun':     { sign: 'Leo',         startDeg: 0,  endDeg: 20 },
    'Moon':    { sign: 'Taurus',      startDeg: 3,  endDeg: 30 },
    'Mars':    { sign: 'Aries',       startDeg: 0,  endDeg: 12 },
    'Mercury': { sign: 'Virgo',       startDeg: 16, endDeg: 20 },
    'Jupiter': { sign: 'Sagittarius', startDeg: 0,  endDeg: 10 },
    'Venus':   { sign: 'Libra',       startDeg: 0,  endDeg: 15 },
    'Saturn':  { sign: 'Aquarius',    startDeg: 0,  endDeg: 20 },
};

// Natural friendship table (Naisargika Maitri) per Parashara
// 1 = friend, 0 = neutral, -1 = enemy
const NATURAL_FRIENDSHIP: Partial<Record<PlanetName, Partial<Record<PlanetName, number>>>> = {
    'Sun':     { 'Moon': 1, 'Mars': 1, 'Jupiter': 1, 'Venus': -1, 'Saturn': -1, 'Mercury': 0, 'Rahu': -1, 'Ketu': -1 },
    'Moon':    { 'Sun': 1, 'Mercury': 1, 'Mars': 0, 'Jupiter': 0, 'Venus': 0, 'Saturn': 0, 'Rahu': -1, 'Ketu': -1 },
    'Mars':    { 'Sun': 1, 'Moon': 1, 'Jupiter': 1, 'Venus': 0, 'Saturn': 0, 'Mercury': -1, 'Rahu': -1, 'Ketu': -1 },
    'Mercury': { 'Sun': 1, 'Venus': 1, 'Moon': -1, 'Mars': 0, 'Jupiter': 0, 'Saturn': 0, 'Rahu': -1, 'Ketu': -1 },
    'Jupiter': { 'Sun': 1, 'Moon': 1, 'Mars': 1, 'Mercury': -1, 'Venus': -1, 'Saturn': 0, 'Rahu': -1, 'Ketu': -1 },
    'Venus':   { 'Mercury': 1, 'Saturn': 1, 'Sun': -1, 'Moon': -1, 'Mars': 0, 'Jupiter': 0, 'Rahu': 0, 'Ketu': 0 },
    'Saturn':  { 'Mercury': 1, 'Venus': 1, 'Sun': -1, 'Moon': -1, 'Mars': -1, 'Jupiter': 0, 'Rahu': 1, 'Ketu': 1 },
};

/**
 * Compute the dignity of a planet in a given sign and degree.
 * Priority: Exalted > Debilitated > Mooltrikona > Own Sign > Friendly/Neutral/Enemy
 */
export function computeDignity(planetName: PlanetName, sign: ZodiacSign, degreeInSign: number): Dignity | undefined {
    // Skip for outer planets and Ascendant
    if (['Uranus', 'Neptune', 'Pluto', 'Ascendant'].includes(planetName)) return undefined;

    // Check Exaltation
    const exalt = EXALTATION[planetName];
    if (exalt && exalt.sign === sign) return 'Exalted';

    // Check Debilitation
    const debil = DEBILITATION[planetName];
    if (debil === sign) return 'Debilitated';

    // Check Mooltrikona (before own sign, since MT is a subset of own sign for some planets)
    const mt = MOOLTRIKONA[planetName];
    if (mt && mt.sign === sign && degreeInSign >= mt.startDeg && degreeInSign < mt.endDeg) return 'Mooltrikona';

    // Check Own Sign
    const ownSigns = OWN_SIGNS[planetName];
    if (ownSigns && ownSigns.includes(sign)) return 'Own Sign';

    // Check Friendship with sign lord
    const signLordIndex = ZODIAC_SIGNS.indexOf(sign);
    const signLord = PLANET_LORDS[signLordIndex];
    const friendshipTable = NATURAL_FRIENDSHIP[planetName];
    if (friendshipTable && signLord) {
        const relation = friendshipTable[signLord];
        if (relation === 1) return 'Friendly';
        if (relation === -1) return 'Enemy';
        return 'Neutral';
    }

    return 'Neutral';
}

/**
 * Check if a planet is combust (too close to the Sun).
 * Combustion degrees per Parashara.
 */
export function isCombust(planetName: PlanetName, planetLon: number, sunLon: number): boolean {
    const COMBUST_DEGREES: Partial<Record<PlanetName, number>> = {
        'Moon': 12,
        'Mars': 17,
        'Mercury': 14, // 12 if retrograde, but we use 14 as standard
        'Jupiter': 11,
        'Venus': 10, // 8 if retrograde
        'Saturn': 15,
    };

    const limit = COMBUST_DEGREES[planetName];
    if (!limit) return false;

    let diff = Math.abs(planetLon - sunLon);
    if (diff > 180) diff = 360 - diff;
    return diff <= limit;
}

/**
 * Compute mean obliquity of the ecliptic for a given date.
 * IAU 1980 formula.
 */
export function computeObliquity(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    // Mean obliquity in arcseconds from J2000.0
    const eps0 = 84381.448 - 46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T;
    return eps0 / 3600; // Convert to degrees
}

/**
 * Compute Lahiri Ayanamsa with higher-order terms.
 * Based on IAU precession with Lahiri epoch calibration.
 */
export function computeAyanamsa(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    const LAHIRI_J2000 = 23.853889; // 23°51'14" at J2000.0
    // General precession in longitude (IAU 1976)
    const precessionArcsec = 5029.0966 * T + 1.1120 * T * T - 0.000006 * T * T * T;
    return LAHIRI_J2000 + precessionArcsec / 3600;
}

/**
 * Determine life stage from age for context-aware predictions.
 */
export function getLifeStage(age: number): string {
    if (age < 2) return 'infant';
    if (age < 6) return 'toddler';
    if (age < 13) return 'child';
    if (age < 18) return 'teenager';
    if (age < 25) return 'young_adult';
    if (age < 40) return 'adult';
    if (age < 60) return 'middle_aged';
    return 'senior';
}

export function normalizeDegree(deg: number): number {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
}

export function dmToDegrees(deg: number, min: number, sec: number = 0): number {
    return deg + min / 60 + sec / 3600;
}

export function degreesToDms(deg: number): { deg: number; min: number; sec: number } {
    const d = Math.floor(deg);
    const mFull = (deg - d) * 60;
    const m = Math.floor(mFull);
    const s = Math.round((mFull - m) * 60);
    return { deg: d, min: m, sec: s };
}

export function getZodiacSign(lon: number): { sign: ZodiacSign; lord: PlanetName; signIndex: number } {
    const normalized = normalizeDegree(lon);
    const index = Math.floor(normalized / 30);
    return {
        sign: ZODIAC_SIGNS[index],
        lord: PLANET_LORDS[index],
        signIndex: index
    };
}

export function getNakshatra(lon: number): { name: string; lord: PlanetName; pada: number } {
    const normalized = normalizeDegree(lon);
    // Each Nakshatra is 13deg 20min = 13.3333... degrees
    const oneNakshatra = 360 / 27;
    const index = Math.floor(normalized / oneNakshatra);
    const remainder = normalized - index * oneNakshatra;

    // Each Pada is 3deg 20min = 3.3333... degrees (1/4 of Nakshatra)
    const onePada = oneNakshatra / 4;
    const pada = Math.floor(remainder / onePada) + 1;

    const nak = NAKSHATRAS[index];
    return {
        name: nak?.name || 'Unknown',
        lord: nak?.lord as PlanetName,
        pada
    };
}
