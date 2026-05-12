export type ChartLayoutStyle = 'north' | 'south' | 'east';

export type AnalysisSystem =
    | 'select_for_me'
    | 'parashara'
    | 'jaimini'
    | 'nadi'
    | 'kp'
    | 'kerala'
    | 'tajika'
    | 'prashna'
    | 'muhurta'
    | 'nakshatra'
    | 'tantric';

export type OptionalFeature =
    | 'kundli_matching'
    | 'panchang_muhurta'
    | 'dosha_analysis'
    | 'more_varga_charts'
    | 'yoga_detection'
    | 'shadbala_ashtakavarga';

export interface AnalysisPreferences {
    chartStyle: ChartLayoutStyle;
    analysisSystem: AnalysisSystem;
    optionalFeatures: OptionalFeature[];
}

export const CHART_STYLE_OPTIONS: { id: ChartLayoutStyle; label: string; description: string }[] = [
    { id: 'north', label: 'North Indian', description: 'Fixed-house diamond layout.' },
    { id: 'south', label: 'South Indian', description: 'Fixed-sign square layout.' },
    { id: 'east', label: 'East Indian', description: 'Regional square layout.' },
];

export const ANALYSIS_SYSTEM_OPTIONS: { id: AnalysisSystem; label: string; description: string }[] = [
    { id: 'select_for_me', label: "Select for me / I don't know", description: 'Best when you are unsure. The app chooses the most suitable reading style for the chart and question.' },
    { id: 'parashara', label: 'Parashara System', description: 'A broad classical reading for personality, life areas, timing periods, and current transits.' },
    { id: 'jaimini', label: 'Jaimini System', description: 'Useful for life direction, roles, and broader destiny themes when enough chart support is available.' },
    { id: 'nadi', label: 'Nadi Astrology', description: 'A more narrative style that connects chart patterns into life themes and turning points.' },
    { id: 'kp', label: 'KP Astrology', description: 'A precise event-focused style. The report will stay conservative where exact KP sub-lord data is unavailable.' },
    { id: 'kerala', label: 'Kerala Astrology', description: 'A traditional South Indian regional style with practical timing and remedial emphasis.' },
    { id: 'tajika', label: 'Tajika System', description: 'Best for yearly themes, near-term developments, and annual forecast framing.' },
    { id: 'prashna', label: 'Prashna Astrology', description: 'Best for a specific question. For a birth chart report, it will be used only as a question-focused lens.' },
    { id: 'muhurta', label: 'Muhurta', description: 'Best for choosing better timing for an activity. Use the Panchang & Muhurat tab for a dedicated date search.' },
    { id: 'nakshatra', label: 'Nakshatra Astrology', description: 'Focuses on the Moon nakshatra, padas, and subtle temperament patterns.' },
    { id: 'tantric', label: 'Tantric Astrology', description: 'A spiritual and remedial framing that stays away from fear-based or ritual-heavy claims.' },
];

export const OPTIONAL_FEATURE_OPTIONS: { id: OptionalFeature; label: string; description: string }[] = [
    { id: 'kundli_matching', label: 'Kundli Matching (Milan)', description: 'Compare two people for relationship compatibility.' },
    { id: 'panchang_muhurta', label: 'Panchang & Muhurat', description: 'Shortlist better dates for an important activity.' },
    { id: 'dosha_analysis', label: 'Dosha Analysis', description: 'Review common dosha concerns without fear-based conclusions.' },
    { id: 'more_varga_charts', label: 'More Varga Charts', description: 'Look deeper into career, marriage, children, education, and other life areas.' },
    { id: 'yoga_detection', label: 'Yoga Detection', description: 'Find supportive chart combinations and explain what they may help with.' },
    { id: 'shadbala_ashtakavarga', label: 'Shadbala / Ashtakavarga', description: 'Understand relative planetary strengths and weak spots.' },
];

export const DEFAULT_ANALYSIS_PREFERENCES: AnalysisPreferences = {
    chartStyle: 'south',
    analysisSystem: 'select_for_me',
    optionalFeatures: [],
};

export function getAnalysisSystemLabel(id: AnalysisSystem): string {
    return ANALYSIS_SYSTEM_OPTIONS.find(option => option.id === id)?.label ?? id;
}

export function getOptionalFeatureLabel(id: OptionalFeature): string {
    return OPTIONAL_FEATURE_OPTIONS.find(option => option.id === id)?.label ?? id;
}
