export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type PlanetName = 
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' 
  | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu' 
  | 'Uranus' | 'Neptune' | 'Pluto' | 'Ascendant';

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
  dignity?: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy';
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
  };
  dasha: {
    current: string;
    list: any[]; // To be defined detailed
  };
}
