export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type PlanetName = 
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' 
  | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu' 
  | 'Uranus' | 'Neptune' | 'Pluto' | 'Ascendant';

export type Dignity = 'Exalted' | 'Debilitated' | 'Own Sign' | 'Mooltrikona' | 'Friendly' | 'Neutral' | 'Enemy';

export interface PlanetPosition {
  name: PlanetName;
  longitude: number; // 0-360
  latitude: number;
  speed: number;
  sign: ZodiacSign;
  signLord: PlanetName;
  nakshatra: string;
  nakshatraLord: PlanetName;
  pada: number;
  house: number; // 1-12
  isRetrograde: boolean;
  dignity?: Dignity;
  isCombust?: boolean;
  degreeInSign?: number; // 0-30, degree within the sign
}

export interface DashaPeriod {
  lord: PlanetName;
  startDate: string; // ISO date string for serialization
  endDate: string;   // ISO date string for serialization
  durationYears: number;
  isCurrent?: boolean;
  subPeriods?: DashaPeriod[]; // Antardasha
}

export interface HouseSystem {
  [key: number]: {
    sign: ZodiacSign;
    signOwner: PlanetName;
    startDegree: number;
    endDegree: number;
    planets: PlanetName[];
  }
}

export interface BirthDetails {
  dateString: string; // YYYY-MM-DD
  timeString: string; // HH:mm
  lat: number;
  lon: number;
  timezone: number; // Offset in hours
  name?: string;
  city?: string;
  country?: string;
  timeZoneId?: string; // IANA timezone, preferred when available
}

export interface TransitPosition {
  name: PlanetName;
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  nakshatra: string;
  pada: number;
  houseFromAscendant: number;
  isRetrograde: boolean;
}

export interface TransitContext {
  calculatedAt: string;
  ayanamsa: number;
  planets: TransitPosition[];
  summary: string[];
  limitations: string[];
}

export interface CalculationMetadata {
  birthUtc: string;
  timezoneOffsetHours: number;
  timeZoneId?: string;
  ayanamsaModel: 'Approximate Lahiri';
  houseSystem: 'Whole Sign';
  nodeType: 'Mean Lunar Node';
  ephemerisSource: 'astronomy-engine';
  accuracyNotes: string[];
}

export interface KundaliResult {
  birthDetails: BirthDetails;
  ayanamsa: number; // Lahiri
  ayanamsaName: string;
  planets: PlanetPosition[];
  houses: HouseSystem;
  ascendant: PlanetPosition;
  vargas: {
    D1: PlanetPosition[]; // Rasi
    D9: PlanetPosition[]; // Navamsa
    D9Ascendant: PlanetPosition; // Navamsa Ascendant (properly computed)
  };
  dasha: {
    current: string;       // Human-readable current period description
    currentLord: string;   // Current Mahadasha lord
    currentSubLord: string; // Current Antardasha lord
    list: DashaPeriod[];
  };
  age: number; // Computed age of the person
  lifeStage: string; // infant, child, teenager, young_adult, adult, middle_aged, senior
  transits: TransitContext;
  metadata: CalculationMetadata;
}
