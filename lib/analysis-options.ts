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
    { id: 'select_for_me', label: "Select for me / I don't know", description: 'Uses the strongest currently supported approach from available chart data.' },
    { id: 'parashara', label: 'Parashara System', description: 'Classical house, lordship, dignity, dasha, and transit reading.' },
    { id: 'jaimini', label: 'Jaimini System', description: 'Uses Jaimini framing where available, but full karaka calculations are not implemented yet.' },
    { id: 'nadi', label: 'Nadi Astrology', description: 'Uses Nadi-style interpretive framing only; no Nadi manuscript database is implemented.' },
    { id: 'kp', label: 'KP Astrology', description: 'Requires cusp/sub-lord calculations that are not implemented yet.' },
    { id: 'kerala', label: 'Kerala Astrology', description: 'Regional framing; full Kerala Panchang and Prashna modules are not implemented yet.' },
    { id: 'tajika', label: 'Tajika System', description: 'Annual chart framing only; Varshphal calculations are not implemented yet.' },
    { id: 'prashna', label: 'Prashna Astrology', description: 'Requires question time/place; natal-only data cannot produce true Prashna.' },
    { id: 'muhurta', label: 'Muhurta', description: 'Requires target activity and date window; full electional search is not implemented yet.' },
    { id: 'nakshatra', label: 'Nakshatra Astrology', description: 'Emphasizes Moon nakshatra, padas, and nakshatra lords.' },
    { id: 'tantric', label: 'Tantric Astrology', description: 'Spiritual/remedial framing only; no ritual prescription engine is implemented.' },
];

export const OPTIONAL_FEATURE_OPTIONS: { id: OptionalFeature; label: string; description: string }[] = [
    { id: 'kundli_matching', label: 'Kundli Matching (Milan)', description: 'Needs partner birth details for a real matching score.' },
    { id: 'panchang_muhurta', label: 'Panchang & Muhurat', description: 'Requires Panchang calculations and target activity/date window.' },
    { id: 'dosha_analysis', label: 'Dosha Analysis', description: 'Can discuss visible risk factors, but a rule-based dosha engine is still needed.' },
    { id: 'more_varga_charts', label: 'More Varga Charts', description: 'D1 and D9 exist today; D10/D7/D12 and others are pending.' },
    { id: 'yoga_detection', label: 'Yoga Detection', description: 'Can explain likely themes, but rule-based yoga detection is pending.' },
    { id: 'shadbala_ashtakavarga', label: 'Shadbala / Ashtakavarga', description: 'Requires dedicated strength and bindu calculations.' },
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
