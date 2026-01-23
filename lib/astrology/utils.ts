import { PlanetName, ZodiacSign } from './types';

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
