import * as Astronomy from 'astronomy-engine';
import {
    BirthDetails,
    KundaliResult,
    PlanetPosition,
    HouseSystem,
    PlanetName,
    ZodiacSign
} from './types';
import {
    getZodiacSign,
    getNakshatra,
    normalizeDegree,
    ZODIAC_SIGNS
} from './utils';

// Lahiri Ayanamsa Constants
const LAHIRI_J2000 = 23.853056;
const PRECESSION_RATE = 50.27 / 3600;

function calculateLahiriAyanamsa(date: Date): number {
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);
    const years = daysSinceJ2000 / 365.25;
    return LAHIRI_J2000 + (years * PRECESSION_RATE);
}

function getJulianDay(date: Date): number {
    return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
}

function calculateMeanNode(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    let lon = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
    return normalizeDegree(lon);
}

function calculateAscendant(date: Date, lat: number, lon: number): number {
    const time = Astronomy.MakeTime(date);
    const gmst = Astronomy.SiderealTime(time);
    const lmst = (gmst * 15 + lon) % 360;
    const ramc = lmst * (Math.PI / 180);
    const eps = 23.4392911 * (Math.PI / 180);
    const latitude = lat * (Math.PI / 180);
    const top = Math.cos(ramc);
    // Corrected generic formula sign for Ascendant
    // tan(Asc) = cos(RAMC) / (-sin(RAMC)cos(eps) - tan(lat)sin(eps))  <-- This is for East Point?
    // Let's use the standard one:
    // H = RAMC + 90deg? 
    // Let's calculate from Altitude/Azimuth of Ecliptic points:
    // Iterate 0 to 360 to find Ascendant (Altitude 0, Azimuth 90ish)
    // Or stick to formula: arcTan2(cos RAMC, -sin RAMC cos Obl - tan Lat sin Obl)
    const bottom = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(latitude) * Math.sin(eps));
    let asc = Math.atan2(top, bottom) * (180 / Math.PI);
    return normalizeDegree(asc);
}

interface DashaPeriod {
    lord: PlanetName;
    startDate: Date;
    endDate: Date;
    durationYears: number;
}

const DASHA_ORDER: { lord: PlanetName; years: number }[] = [
    { lord: 'Ketu', years: 7 },
    { lord: 'Venus', years: 20 },
    { lord: 'Sun', years: 6 },
    { lord: 'Moon', years: 10 },
    { lord: 'Mars', years: 7 },
    { lord: 'Rahu', years: 18 },
    { lord: 'Jupiter', years: 16 },
    { lord: 'Saturn', years: 19 },
    { lord: 'Mercury', years: 17 }
];

function calculateVimshottari(moonLon: number, birthDate: Date): { current: string; list: DashaPeriod[] } {
    // 1. Find Moon's Nakshatra position
    const nak = getNakshatra(moonLon);
    // Find which Nakshatra index (0-26)
    const dist = normalizeDegree(moonLon);
    const nakIndex = Math.floor(dist / (360 / 27));

    // Map Nakshatra index to Dasha Lord index
    // Ashwini(0) -> Ketu. Bharani(1) -> Venus.
    // The DASHA_ORDER matches exactly the sequence starting from Ashwini? 
    // Wait, Ashwini Lord is Ketu. Sequence starts Ketu. Yes.
    // So nakIndex % 9 gives the index in DASHA_ORDER ?
    // 0 (Ashwini) -> Ketu (0). 1 (Bharani) -> Venus (1). Correct.

    const lordIndex = nakIndex % 9;
    const passedDegInNak = dist % (360 / 27);
    const fractionPassed = passedDegInNak / (360 / 27);
    const fractionRemaining = 1 - fractionPassed;

    const startLord = DASHA_ORDER[lordIndex];
    const balanceYears = startLord.years * fractionRemaining;

    // Calculate series
    const list: DashaPeriod[] = [];
    let currentDate = new Date(birthDate);

    // First period (Balance)
    const firstEndDate = new Date(currentDate.getTime() + balanceYears * 365.25 * 24 * 3600 * 1000);
    list.push({
        lord: startLord.lord,
        startDate: currentDate,
        endDate: firstEndDate,
        durationYears: balanceYears // Approx
    });

    currentDate = firstEndDate;

    // Next periods logic
    for (let i = 1; i < 9 * 3; i++) { // Generate for 3 cycles (enough for 120+ years usually)
        const idx = (lordIndex + i) % 9;
        const rule = DASHA_ORDER[idx];
        const end = new Date(currentDate.getTime() + rule.years * 365.25 * 24 * 3600 * 1000);
        list.push({
            lord: rule.lord,
            startDate: currentDate,
            endDate: end,
            durationYears: rule.years
        });
        currentDate = end;
        if (currentDate.getFullYear() > birthDate.getFullYear() + 100) break;
    }

    // Determine current dasha
    const now = new Date(); // Or today?
    // Current dasha relative to "now"? Or relative to birth time implies outputting the whole list.
    // We return the list.

    return { current: '', list };
}

export function calculateKundali(input: BirthDetails): KundaliResult {
    const dtStr = `${input.dateString}T${input.timeString}:00`;
    const localDate = new Date(dtStr);

    if (isNaN(localDate.getTime())) {
        throw new Error(`Invalid Date/Time provided: ${input.dateString} ${input.timeString}`);
    }

    const utcMs = localDate.getTime() - (input.timezone * 3600 * 1000);
    const date = new Date(utcMs);

    const ayanamsa = calculateLahiriAyanamsa(date);
    const time = Astronomy.MakeTime(date);
    const jd = getJulianDay(date);

    const bodies: { name: PlanetName; astrBody: Astronomy.Body | null }[] = [
        { name: 'Sun', astrBody: Astronomy.Body.Sun },
        { name: 'Moon', astrBody: Astronomy.Body.Moon },
        { name: 'Mars', astrBody: Astronomy.Body.Mars },
        { name: 'Mercury', astrBody: Astronomy.Body.Mercury },
        { name: 'Jupiter', astrBody: Astronomy.Body.Jupiter },
        { name: 'Venus', astrBody: Astronomy.Body.Venus },
        { name: 'Saturn', astrBody: Astronomy.Body.Saturn },
        { name: 'Rahu', astrBody: null },
        { name: 'Ketu', astrBody: null },
        { name: 'Uranus', astrBody: Astronomy.Body.Uranus },
        { name: 'Neptune', astrBody: Astronomy.Body.Neptune },
        { name: 'Pluto', astrBody: Astronomy.Body.Pluto },
    ];

    const planets: PlanetPosition[] = [];
    const meanNode = calculateMeanNode(jd);

    const ascLonTropical = calculateAscendant(date, input.lat, input.lon);
    const ascLonSidereal = normalizeDegree(ascLonTropical - ayanamsa);
    const ascInfo = getZodiacSign(ascLonSidereal);
    const ascNak = getNakshatra(ascLonSidereal);

    const ascendant: PlanetPosition = {
        name: 'Ascendant',
        longitude: ascLonSidereal,
        latitude: 0,
        speed: 0,
        sign: ascInfo.sign,
        signLord: ascInfo.lord,
        nakshatra: ascNak.name,
        nakshatraLord: ascNak.lord,
        pada: ascNak.pada,
        house: 1,
        isRetrograde: false
    };

    bodies.forEach(b => {
        let tropicalLon = 0;
        let lat = 0;
        let speed = 0;

        if (b.name === 'Rahu') {
            tropicalLon = meanNode;
            speed = -0.05295;
        } else if (b.name === 'Ketu') {
            tropicalLon = normalizeDegree(meanNode + 180);
            speed = -0.05295;
        } else if (b.astrBody) {
            const vec = Astronomy.GeoVector(b.astrBody, time, true);
            const ecl = Astronomy.Ecliptic(vec);
            tropicalLon = ecl.elon;
            lat = ecl.elat;
            // Calculate speed roughly
            const timeNext = Astronomy.MakeTime(new Date(date.getTime() + 3600000));
            const vecNext = Astronomy.GeoVector(b.astrBody, timeNext, true);
            const eclNext = Astronomy.Ecliptic(vecNext);
            const delta = eclNext.elon - ecl.elon;
            // Handle 360 wrap
            let diff = delta;
            if (diff < -180) diff += 360;
            if (diff > 180) diff -= 360;
            speed = diff * 24; // deg per day approx
        } else {
            return;
        }

        const siderealLon = normalizeDegree(tropicalLon - ayanamsa);
        const signInfo = getZodiacSign(siderealLon);
        const nakInfo = getNakshatra(siderealLon);
        const houseIndex = (signInfo.signIndex - ascInfo.signIndex + 12) % 12 + 1;

        planets.push({
            name: b.name,
            longitude: siderealLon,
            latitude: lat,
            speed: speed,
            sign: signInfo.sign,
            signLord: signInfo.lord,
            nakshatra: nakInfo.name,
            nakshatraLord: nakInfo.lord,
            pada: nakInfo.pada,
            house: houseIndex,
            isRetrograde: speed < 0 || (b.name === 'Rahu' || b.name === 'Ketu')
        });
    });

    const getD9Pos = (p: PlanetPosition): PlanetPosition => {
        const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
        let startSignIdx = 0;
        const element = signIdx % 4;
        if (element === 0) startSignIdx = 0;
        if (element === 1) startSignIdx = 9;
        if (element === 2) startSignIdx = 6;
        if (element === 3) startSignIdx = 3;
        const degInSign = p.longitude % 30;
        const navamsaInSign = Math.floor(degInSign / (30 / 9));
        const navamsaSignIdx = (startSignIdx + navamsaInSign) % 12;
        return {
            ...p,
            sign: ZODIAC_SIGNS[navamsaSignIdx],
            signLord: getZodiacSign(navamsaSignIdx * 30).lord
        };
    };

    const ascendantD9 = getD9Pos(ascendant);
    const d9Planets = planets.map(p => {
        const pD9 = getD9Pos(p);
        const pSignIdx = ZODIAC_SIGNS.indexOf(pD9.sign);
        const ascSignIdx = ZODIAC_SIGNS.indexOf(ascendantD9.sign);
        const house = (pSignIdx - ascSignIdx + 12) % 12 + 1;
        return { ...pD9, house };
    });

    // Calculate Houses Object
    const houses: HouseSystem = {};
    for (let i = 1; i <= 12; i++) {
        // Whole Sign: House 1 is AscSign (0 to 30 deg relative to sign start)
        // Actually House 1 spans the entire sign of Ascendant.
        const signIndex = (ascInfo.signIndex + (i - 1)) % 12;
        const sign = ZODIAC_SIGNS[signIndex];
        const signLord = getZodiacSign(signIndex * 30 + 15).lord;

        const planetsInHouse = planets.filter(p => p.house === i).map(p => p.name);

        houses[i] = {
            sign,
            signOwner: signLord as PlanetName,
            startDegree: i * 30, // Abstract degree? No, real degrees in zodiac.
            endDegree: (i + 1) * 30,
            planets: planetsInHouse
        };
    }

    // Dasha
    const moon = planets.find(p => p.name === 'Moon');
    const dasha = moon ? calculateVimshottari(moon.longitude, date) : { current: '', list: [] };

    return {
        birthDetails: input,
        ayanamsa,
        ayanamsaName: 'Lahiri',
        planets,
        ascendant,
        houses,
        vargas: {
            D1: planets,
            D9: d9Planets
        },
        dasha
    };
}
