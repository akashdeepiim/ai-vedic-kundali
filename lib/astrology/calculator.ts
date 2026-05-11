import * as Astronomy from 'astronomy-engine';
import {
    BirthDetails,
    KundaliResult,
    PlanetPosition,
    HouseSystem,
    PlanetName,
    DashaPeriod,
    TransitContext,
    TransitPosition
} from './types';
import {
    getZodiacSign,
    getNakshatra,
    normalizeDegree,
    ZODIAC_SIGNS,
    computeObliquity,
    computeAyanamsa,
    computeDignity,
    isCombust,
    getLifeStage
} from './utils';

// ---------------------------------------------------------------------------
// Julian Day helper
// ---------------------------------------------------------------------------
function getJulianDay(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
}

// ---------------------------------------------------------------------------
// Rahu (Mean Lunar Node)
// ---------------------------------------------------------------------------
function calculateMeanNode(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    const lon = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
    return normalizeDegree(lon);
}

function parseBirthDateParts(dateString: string, timeString: string) {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);

    if (![year, month, day, hours, minutes].every(Number.isFinite)) {
        throw new Error(`Invalid Date/Time provided: ${dateString} ${timeString}`);
    }

    return { year, month, day, hours, minutes };
}

function getOffsetHoursForInstant(timeZoneId: string, instant: Date): number {
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

    const asUtc = Date.UTC(
        value('year'),
        value('month') - 1,
        value('day'),
        value('hour'),
        value('minute'),
        value('second')
    );

    return (asUtc - instant.getTime()) / 3600000;
}

function convertLocalBirthToUtc(input: BirthDetails): { date: Date; offsetHours: number } {
    const { year, month, day, hours, minutes } = parseBirthDateParts(input.dateString, input.timeString);
    const localAsUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0);

    let offsetHours = input.timezone;

    if (input.timeZoneId) {
        let guessUtcMs = localAsUtcMs - offsetHours * 3600000;
        for (let i = 0; i < 3; i++) {
            offsetHours = getOffsetHoursForInstant(input.timeZoneId, new Date(guessUtcMs));
            guessUtcMs = localAsUtcMs - offsetHours * 3600000;
        }
    }

    const date = new Date(localAsUtcMs - offsetHours * 3600000);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid Date/Time provided: ${input.dateString} ${input.timeString}`);
    }

    return { date, offsetHours };
}

// ---------------------------------------------------------------------------
// Ascendant (Lagna) – standard formula with date-accurate obliquity
// ---------------------------------------------------------------------------
function calculateAscendant(date: Date, lat: number, lon: number, jd: number): number {
    const time = Astronomy.MakeTime(date);
    const gmst = Astronomy.SiderealTime(time);
    const lmst = (gmst * 15 + lon) % 360;
    const ramc = lmst * (Math.PI / 180);

    // Use date-accurate obliquity instead of hardcoded constant
    const epsDeg = computeObliquity(jd);
    const eps = epsDeg * (Math.PI / 180);
    const latitude = lat * (Math.PI / 180);

    const top = Math.cos(ramc);
    const bottom = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(latitude) * Math.sin(eps));
    const asc = Math.atan2(top, bottom) * (180 / Math.PI);
    return normalizeDegree(asc);
}

// ---------------------------------------------------------------------------
// Vimshottari Dasha system
// ---------------------------------------------------------------------------
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
const TOTAL_DASHA_YEARS = 120;
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

/**
 * Calculate Antardasha (sub-periods) within a Mahadasha.
 * Sub-period order starts with the Mahadasha lord and follows Dasha order.
 * Duration formula: (Mahadasha years × Antardasha planet years) / 120
 */
function calculateAntardasha(mahadasha: { lord: PlanetName; years: number }, startMs: number): DashaPeriod[] {
    const subPeriods: DashaPeriod[] = [];
    const lordIdx = DASHA_ORDER.findIndex(d => d.lord === mahadasha.lord);
    let currentMs = startMs;

    for (let i = 0; i < 9; i++) {
        const subIdx = (lordIdx + i) % 9;
        const subRule = DASHA_ORDER[subIdx];
        const subYears = (mahadasha.years * subRule.years) / TOTAL_DASHA_YEARS;
        const subEndMs = currentMs + subYears * MS_PER_YEAR;

        subPeriods.push({
            lord: subRule.lord,
            startDate: new Date(currentMs).toISOString(),
            endDate: new Date(subEndMs).toISOString(),
            durationYears: subYears,
        });
        currentMs = subEndMs;
    }
    return subPeriods;
}

interface DashaResult {
    current: string;
    currentLord: string;
    currentSubLord: string;
    list: DashaPeriod[];
}

function calculateVimshottari(moonLon: number, birthDate: Date): DashaResult {
    const dist = normalizeDegree(moonLon);
    const nakIndex = Math.floor(dist / (360 / 27));
    const lordIndex = nakIndex % 9;

    const passedDegInNak = dist % (360 / 27);
    const fractionPassed = passedDegInNak / (360 / 27);
    const fractionRemaining = 1 - fractionPassed;

    const startLord = DASHA_ORDER[lordIndex];
    const balanceYears = startLord.years * fractionRemaining;

    const list: DashaPeriod[] = [];
    let currentMs = birthDate.getTime();
    const now = Date.now();

    // First period (Balance of birth Nakshatra lord Dasha)
    const firstEndMs = currentMs + balanceYears * MS_PER_YEAR;
    const firstSubPeriods = calculateAntardasha(
        { lord: startLord.lord, years: balanceYears },
        currentMs
    );
    list.push({
        lord: startLord.lord,
        startDate: new Date(currentMs).toISOString(),
        endDate: new Date(firstEndMs).toISOString(),
        durationYears: balanceYears,
        isCurrent: now >= currentMs && now < firstEndMs,
        subPeriods: firstSubPeriods,
    });
    currentMs = firstEndMs;

    // Subsequent full Dasha periods
    for (let i = 1; i < 9 * 2; i++) { // 2 cycles = 240 years, more than enough
        const idx = (lordIndex + i) % 9;
        const rule = DASHA_ORDER[idx];
        const endMs = currentMs + rule.years * MS_PER_YEAR;

        const subPeriods = calculateAntardasha(rule, currentMs);

        list.push({
            lord: rule.lord,
            startDate: new Date(currentMs).toISOString(),
            endDate: new Date(endMs).toISOString(),
            durationYears: rule.years,
            isCurrent: now >= currentMs && now < endMs,
            subPeriods,
        });
        currentMs = endMs;
        if (new Date(currentMs).getFullYear() > birthDate.getFullYear() + 120) break;
    }

    // Identify current Mahadasha and Antardasha
    let currentDashaStr = '';
    let currentLord = '';
    let currentSubLord = '';

    const currentMaha = list.find(d => d.isCurrent);
    if (currentMaha) {
        currentLord = currentMaha.lord;
        const currentAntar = currentMaha.subPeriods?.find(sub => {
            const s = new Date(sub.startDate).getTime();
            const e = new Date(sub.endDate).getTime();
            return now >= s && now < e;
        });
        if (currentAntar) {
            currentSubLord = currentAntar.lord;
            currentAntar.isCurrent = true;
            currentDashaStr = `${currentMaha.lord} Mahadasha / ${currentAntar.lord} Antardasha`;
        } else {
            currentDashaStr = `${currentMaha.lord} Mahadasha`;
        }
    }

    return {
        current: currentDashaStr,
        currentLord,
        currentSubLord,
        list,
    };
}

// ---------------------------------------------------------------------------
// Navamsa (D-9) position helper
// ---------------------------------------------------------------------------
function getD9Position(p: PlanetPosition): PlanetPosition {
    const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
    // Starting sign for Navamsa depends on element of the Rasi sign
    const element = signIdx % 4;
    let startSignIdx = 0;
    if (element === 0) startSignIdx = 0;  // Fire -> Aries
    if (element === 1) startSignIdx = 9;  // Earth -> Capricorn
    if (element === 2) startSignIdx = 6;  // Air -> Libra
    if (element === 3) startSignIdx = 3;  // Water -> Cancer

    const degInSign = normalizeDegree(p.longitude) % 30;
    const navamsaInSign = Math.floor(degInSign / (30 / 9));
    const navamsaSignIdx = (startSignIdx + navamsaInSign) % 12;

    return {
        ...p,
        sign: ZODIAC_SIGNS[navamsaSignIdx],
        signLord: getZodiacSign(navamsaSignIdx * 30).lord,
        degreeInSign: degInSign,
    };
}

const TRANSIT_BODIES: { name: PlanetName; astrBody: Astronomy.Body | null }[] = [
    { name: 'Sun', astrBody: Astronomy.Body.Sun },
    { name: 'Moon', astrBody: Astronomy.Body.Moon },
    { name: 'Mars', astrBody: Astronomy.Body.Mars },
    { name: 'Mercury', astrBody: Astronomy.Body.Mercury },
    { name: 'Jupiter', astrBody: Astronomy.Body.Jupiter },
    { name: 'Venus', astrBody: Astronomy.Body.Venus },
    { name: 'Saturn', astrBody: Astronomy.Body.Saturn },
    { name: 'Rahu', astrBody: null },
    { name: 'Ketu', astrBody: null },
];

function getTropicalLongitudeAndSpeed(
    body: { name: PlanetName; astrBody: Astronomy.Body | null },
    date: Date,
    jd: number
): { tropicalLon: number; speed: number } {
    if (body.name === 'Rahu') {
        return { tropicalLon: calculateMeanNode(jd), speed: -0.05295 };
    }

    if (body.name === 'Ketu') {
        return { tropicalLon: normalizeDegree(calculateMeanNode(jd) + 180), speed: -0.05295 };
    }

    if (!body.astrBody) {
        throw new Error(`Unsupported transit body: ${body.name}`);
    }

    const time = Astronomy.MakeTime(date);
    const ecl = Astronomy.Ecliptic(Astronomy.GeoVector(body.astrBody, time, true));
    const timeNext = Astronomy.MakeTime(new Date(date.getTime() + 3600000));
    const eclNext = Astronomy.Ecliptic(Astronomy.GeoVector(body.astrBody, timeNext, true));
    let diff = eclNext.elon - ecl.elon;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    return {
        tropicalLon: ecl.elon,
        speed: diff * 24,
    };
}

function calculateTransitContext(now: Date, natalAscSignIndex: number): TransitContext {
    const jd = getJulianDay(now);
    const ayanamsa = computeAyanamsa(jd);
    const planets: TransitPosition[] = TRANSIT_BODIES.map(body => {
        const { tropicalLon, speed } = getTropicalLongitudeAndSpeed(body, now, jd);
        const longitude = normalizeDegree(tropicalLon - ayanamsa);
        const signInfo = getZodiacSign(longitude);
        const nakInfo = getNakshatra(longitude);

        return {
            name: body.name,
            longitude,
            sign: signInfo.sign,
            degreeInSign: longitude % 30,
            nakshatra: nakInfo.name,
            pada: nakInfo.pada,
            houseFromAscendant: (signInfo.signIndex - natalAscSignIndex + 12) % 12 + 1,
            isRetrograde: speed < 0 || body.name === 'Rahu' || body.name === 'Ketu',
        };
    });

    const summaryPlanets = planets
        .filter(p => ['Jupiter', 'Saturn', 'Rahu', 'Ketu'].includes(p.name))
        .map(p => `${p.name}: ${p.sign} ${p.degreeInSign.toFixed(2)}°, house ${p.houseFromAscendant} from natal Lagna${p.isRetrograde ? ', retrograde' : ''}`);

    return {
        calculatedAt: now.toISOString(),
        ayanamsa,
        planets,
        summary: summaryPlanets,
        limitations: [
            'Transit houses are measured from natal whole-sign Lagna.',
            'Rahu/Ketu use the mean lunar node.',
            'Daily/weekly interpretations should cite these transit positions and current dasha instead of inventing uncomputed factors.',
        ],
    };
}

// ---------------------------------------------------------------------------
// Main Kundali Calculator
// ---------------------------------------------------------------------------
export function calculateKundali(input: BirthDetails): KundaliResult {
    const { date, offsetHours } = convertLocalBirthToUtc(input);

    const jd = getJulianDay(date);
    const ayanamsa = computeAyanamsa(jd);
    const time = Astronomy.MakeTime(date);

    // --- Compute age and life stage ---
    const now = new Date();
    const ageMs = now.getTime() - date.getTime();
    // For future birth dates (e.g. expected baby), age is 0
    const age = Math.max(0, Math.floor(ageMs / (365.25 * 24 * 3600 * 1000)));
    const lifeStage = getLifeStage(age);

    // --- Planetary positions ---
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

    const meanNode = calculateMeanNode(jd);

    // --- Ascendant ---
    const ascLonTropical = calculateAscendant(date, input.lat, input.lon, jd);
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
        isRetrograde: false,
        degreeInSign: ascLonSidereal % 30,
    };

    // --- Compute all planet positions ---
    const planets: PlanetPosition[] = [];
    let sunSiderealLon = 0; // Track Sun's position for combustion check

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

            // Speed: compute position 1 hour later for daily speed approximation
            const timeNext = Astronomy.MakeTime(new Date(date.getTime() + 3600000));
            const vecNext = Astronomy.GeoVector(b.astrBody, timeNext, true);
            const eclNext = Astronomy.Ecliptic(vecNext);
            let diff = eclNext.elon - ecl.elon;
            if (diff < -180) diff += 360;
            if (diff > 180) diff -= 360;
            speed = diff * 24; // deg per day
        } else {
            return;
        }

        const siderealLon = normalizeDegree(tropicalLon - ayanamsa);
        if (b.name === 'Sun') sunSiderealLon = siderealLon;

        const signInfo = getZodiacSign(siderealLon);
        const nakInfo = getNakshatra(siderealLon);
        const houseIndex = (signInfo.signIndex - ascInfo.signIndex + 12) % 12 + 1;
        const degreeInSign = siderealLon % 30;

        // Determine dignity
        const dignity = computeDignity(b.name, signInfo.sign, degreeInSign);

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
            isRetrograde: speed < 0 || (b.name === 'Rahu' || b.name === 'Ketu'),
            dignity,
            degreeInSign,
        });
    });

    // --- Mark combustion (requires Sun position, so done in second pass) ---
    planets.forEach(p => {
        if (p.name !== 'Sun') {
            p.isCombust = isCombust(p.name, p.longitude, sunSiderealLon);
        }
    });

    // --- Navamsa (D-9) ---
    const ascendantD9 = getD9Position(ascendant);
    const d9Planets = planets.map(p => {
        const pD9 = getD9Position(p);
        const pSignIdx = ZODIAC_SIGNS.indexOf(pD9.sign);
        const ascSignIdx = ZODIAC_SIGNS.indexOf(ascendantD9.sign);
        const house = (pSignIdx - ascSignIdx + 12) % 12 + 1;
        return { ...pD9, house };
    });

    // --- Houses (Whole Sign) ---
    const houses: HouseSystem = {};
    for (let i = 1; i <= 12; i++) {
        const signIndex = (ascInfo.signIndex + (i - 1)) % 12;
        const sign = ZODIAC_SIGNS[signIndex];
        const signLord = getZodiacSign(signIndex * 30 + 15).lord;
        const planetsInHouse = planets.filter(p => p.house === i).map(p => p.name);

        houses[i] = {
            sign,
            signOwner: signLord as PlanetName,
            startDegree: signIndex * 30,
            endDegree: (signIndex + 1) * 30,
            planets: planetsInHouse
        };
    }

    // --- Dasha ---
    const moon = planets.find(p => p.name === 'Moon');
    const dasha = moon
        ? calculateVimshottari(moon.longitude, date)
        : { current: '', currentLord: '', currentSubLord: '', list: [] };
    const transits = calculateTransitContext(new Date(), ascInfo.signIndex);

    return {
        birthDetails: {
            ...input,
            timezone: offsetHours,
        },
        ayanamsa,
        ayanamsaName: 'Lahiri',
        planets,
        ascendant,
        houses,
        vargas: {
            D1: planets,
            D9: d9Planets,
            D9Ascendant: ascendantD9,
        },
        dasha,
        age,
        lifeStage,
        transits,
        metadata: {
            birthUtc: date.toISOString(),
            timezoneOffsetHours: offsetHours,
            timeZoneId: input.timeZoneId,
            ayanamsaModel: 'Approximate Lahiri',
            houseSystem: 'Whole Sign',
            nodeType: 'Mean Lunar Node',
            ephemerisSource: 'astronomy-engine',
            accuracyNotes: [
                'Planetary longitudes are computed from astronomy-engine and converted to sidereal using the local Lahiri approximation in utils.ts.',
                'The chart has not yet been golden-tested against Swiss Ephemeris or a commercial Jyotish engine.',
                'Dasha dates use a 365.25-day year approximation.',
            ],
        },
    };
}
