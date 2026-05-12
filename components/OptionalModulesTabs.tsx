'use client';

import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import {
    BadgeCheck,
    CalendarClock,
    ChartNoAxesCombined,
    CheckCircle2,
    HeartHandshake,
    ListChecks,
    RotateCcw,
    Scale,
    ShieldAlert,
    Sparkles,
    Stars,
} from 'lucide-react';
import BirthForm from '@/components/BirthForm';
import {
    DEFAULT_ANALYSIS_PREFERENCES,
    OPTIONAL_FEATURE_OPTIONS,
    type AnalysisPreferences,
    type OptionalFeature,
} from '@/lib/analysis-options';

type HomeTab = 'birth_chart' | OptionalFeature;
type FieldType = 'text' | 'date' | 'time' | 'number' | 'textarea' | 'select';

interface ModuleField {
    id: string;
    label: string;
    placeholder?: string;
    type?: FieldType;
    required?: boolean;
    helper?: string;
    options?: string[];
    section?: string;
}

interface ModuleInsight {
    title: string;
    status: 'favorable' | 'neutral' | 'caution' | 'unsupported';
    detail: string;
}

interface ModuleScore {
    label: string;
    score: number;
    max: number;
    detail: string;
}

interface ModuleCalculationResult {
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

interface ModuleDefinition {
    icon: ElementType;
    subtitle: string;
    flowGoal: string;
    supportedNow: string[];
    calculationScope: string[];
    fields: ModuleField[];
}

const PRIMARY_BIRTH_FIELDS: ModuleField[] = [
    { id: 'native_name', label: 'Primary person name', placeholder: 'Optional', section: 'Primary birth details' },
    { id: 'native_date', label: 'Birth date', type: 'date', required: true, section: 'Primary birth details' },
    { id: 'native_time', label: 'Birth time', type: 'time', required: true, section: 'Primary birth details' },
    { id: 'native_city', label: 'Birth city', placeholder: 'New Delhi', required: true, section: 'Primary birth details' },
    { id: 'native_country', label: 'Birth country', placeholder: 'India', required: true, section: 'Primary birth details' },
];

const PARTNER_BIRTH_FIELDS: ModuleField[] = [
    { id: 'partner_name', label: 'Partner name', placeholder: 'Optional', section: 'Partner birth details' },
    { id: 'partner_date', label: 'Partner birth date', type: 'date', required: true, section: 'Partner birth details' },
    { id: 'partner_time', label: 'Partner birth time', type: 'time', required: true, section: 'Partner birth details' },
    { id: 'partner_city', label: 'Partner birth city', placeholder: 'Mumbai', required: true, section: 'Partner birth details' },
    { id: 'partner_country', label: 'Partner birth country', placeholder: 'India', required: true, section: 'Partner birth details' },
];

const MODULE_DEFINITIONS: Record<OptionalFeature, ModuleDefinition> = {
    kundli_matching: {
        icon: HeartHandshake,
        subtitle: 'Independent compatibility engine',
        flowGoal: 'Generate both charts directly, then score Ashtakoota and Manglik compatibility without depending on the main birth-chart flow.',
        supportedNow: ['Primary and partner chart generation', 'Ashtakoota scoring', 'Manglik cross-check', 'Compatibility risk summary'],
        calculationScope: ['Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi', 'Mars placement from Lagna, Moon, and Venus', 'Moon sign and nakshatra evidence'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            ...PARTNER_BIRTH_FIELDS,
            {
                id: 'relationship_stage',
                label: 'Relationship stage',
                type: 'select',
                section: 'Matching context',
                options: ['Prospective match', 'Dating', 'Engaged', 'Married', 'Post-conflict review', 'Family-arranged match'],
            },
            { id: 'context', label: 'Question or context', type: 'textarea', section: 'Matching context', placeholder: 'What compatibility question should this answer?' },
        ],
    },
    panchang_muhurta: {
        icon: CalendarClock,
        subtitle: 'Independent Panchang screening engine',
        flowGoal: 'Evaluate a date window for Panchang suitability using event location and timing inputs.',
        supportedNow: ['Tithi', 'Paksha', 'Nakshatra', 'Yoga', 'Weekday', 'Date-window scoring'],
        calculationScope: ['Sidereal Sun and Moon positions', 'Simplified auspiciousness score', 'Top candidate dates with cautions'],
        fields: [
            {
                id: 'activity',
                label: 'Activity',
                type: 'select',
                required: true,
                section: 'Event details',
                options: ['Marriage', 'Business launch', 'Travel', 'Property purchase', 'Griha pravesh', 'Medical procedure', 'Spiritual ceremony', 'Other'],
            },
            { id: 'start_date', label: 'Preferred start date', type: 'date', required: true, section: 'Event details' },
            { id: 'end_date', label: 'Preferred end date', type: 'date', required: true, section: 'Event details' },
            { id: 'event_time', label: 'Preferred event time', type: 'time', placeholder: '12:00', helper: 'Optional; defaults to noon', section: 'Event details' },
            { id: 'event_city', label: 'Event city', placeholder: 'New Delhi', required: true, section: 'Event location' },
            { id: 'event_country', label: 'Event country', placeholder: 'India', required: true, section: 'Event location' },
            { id: 'avoidances', label: 'Dates or constraints to avoid', type: 'textarea', section: 'Event details' },
        ],
    },
    dosha_analysis: {
        icon: ShieldAlert,
        subtitle: 'Independent dosha engine',
        flowGoal: 'Generate the primary chart directly and run deterministic Manglik, Kaal Sarp, and Sade Sati screens.',
        supportedNow: ['Manglik from Lagna, Moon, Venus', 'Kaal Sarp containment screen', 'Sade Sati from current Saturn transit', 'Pressure score'],
        calculationScope: ['Mars relative houses', 'Rahu-Ketu axis containment', 'Transit Saturn relative to natal Moon'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            {
                id: 'dosha_type',
                label: 'Dosha concern',
                type: 'select',
                section: 'Dosha context',
                options: ['Manglik', 'Kaal Sarp', 'Sade Sati', 'Pitru', 'Nadi dosha', 'Multiple concerns', 'Not sure'],
            },
            { id: 'known_context', label: 'Known context', type: 'textarea', section: 'Dosha context' },
        ],
    },
    more_varga_charts: {
        icon: ChartNoAxesCombined,
        subtitle: 'Independent varga placement engine',
        flowGoal: 'Generate the primary chart directly and compute requested divisional sign placements.',
        supportedNow: ['D2, D3, D7, D10, D12, D16, D24, D30, D60 placement screens', 'Question-to-varga mapping', 'Cross-chart caution notes'],
        calculationScope: ['Sidereal longitude division', 'Planetary sign placement by varga', 'Varga strength screen'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            { id: 'requested_vargas', label: 'Requested vargas', placeholder: 'D10, D7, D12, D16, D24, D60', required: true, section: 'Varga context' },
            {
                id: 'question_area',
                label: 'Question area',
                type: 'select',
                section: 'Varga context',
                options: ['Career', 'Marriage', 'Children', 'Property', 'Education', 'Parents', 'Spiritual growth', 'General strength'],
            },
            { id: 'specific_question', label: 'Specific question', type: 'textarea', section: 'Varga context' },
        ],
    },
    yoga_detection: {
        icon: BadgeCheck,
        subtitle: 'Independent yoga detection engine',
        flowGoal: 'Generate the primary chart directly and detect rule-based yoga candidates with activation cautions.',
        supportedNow: ['Gaja Kesari', 'Raja Yoga candidates', 'Dhana Yoga candidates', 'Neecha Bhanga checks', 'Activation screen'],
        calculationScope: ['House lordship', 'Kendra/trikona relations', 'Moon-Jupiter angularity', 'Debilitation cancellation checks'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            {
                id: 'yoga_family',
                label: 'Yoga family to emphasize',
                type: 'select',
                section: 'Yoga context',
                options: ['Raja Yoga', 'Dhana Yoga', 'Gaja Kesari', 'Neecha Bhanga', 'Vipreet Raja Yoga', 'Panch Mahapurush', 'Multiple', 'Not sure'],
            },
            { id: 'known_claims', label: 'Known claims to verify', type: 'textarea', section: 'Yoga context' },
        ],
    },
    shadbala_ashtakavarga: {
        icon: Scale,
        subtitle: 'Independent strength-screen engine',
        flowGoal: 'Generate the primary chart directly and produce a transparent planetary strength screen without overclaiming exact Shadbala/BAV bindus.',
        supportedNow: ['Planetary dignity strength', 'Combustion and retrograde flags', 'House environment adjustment', 'Current transit context'],
        calculationScope: ['Composite strength score', 'Strongest and weakest planets', 'Transit support from natal Lagna'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            {
                id: 'strength_focus',
                label: 'Strength focus',
                type: 'select',
                section: 'Strength context',
                options: ['Overall chart strength', 'Career planets', 'Marriage planets', 'Health indicators', 'Wealth indicators', 'Transit support', 'Specific planet'],
            },
            { id: 'specific_planet_or_house', label: 'Planet or house to inspect', placeholder: 'Saturn, Venus, 10th house...', section: 'Strength context' },
            { id: 'question', label: 'Question', type: 'textarea', section: 'Strength context' },
        ],
    },
};

function readPreferences(): AnalysisPreferences {
    if (typeof window === 'undefined') return DEFAULT_ANALYSIS_PREFERENCES;
    const stored = localStorage.getItem('analysisPreferences');
    if (!stored) return DEFAULT_ANALYSIS_PREFERENCES;
    try {
        return { ...DEFAULT_ANALYSIS_PREFERENCES, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_ANALYSIS_PREFERENCES;
    }
}

function readModuleInputs(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const storedInputs = localStorage.getItem('optionalModuleInputs');
    if (!storedInputs) return {};
    try {
        const parsed = JSON.parse(storedInputs);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function readModuleResults(): Record<string, ModuleCalculationResult> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('optionalModuleResults');
    if (!stored) return {};
    try {
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function moduleKey(module: OptionalFeature, fieldId: string): string {
    return `${module}.${fieldId}`;
}

function unscopedInputs(module: OptionalFeature, inputs: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(inputs)
            .filter(([key]) => key.startsWith(`${module}.`))
            .map(([key, value]) => [key.slice(module.length + 1), value])
    );
}

function getModuleValue(inputs: Record<string, string>, module: OptionalFeature, fieldId: string): string {
    return inputs[moduleKey(module, fieldId)] ?? '';
}

function getMissingRequired(module: OptionalFeature, inputs: Record<string, string>): string[] {
    return MODULE_DEFINITIONS[module].fields
        .filter(field => field.required && !getModuleValue(inputs, module, field.id).trim())
        .map(field => field.label);
}

function buildModuleBrief(module: OptionalFeature, inputs: Record<string, string>, result?: ModuleCalculationResult): string {
    const definition = MODULE_DEFINITIONS[module];
    const label = OPTIONAL_FEATURE_OPTIONS.find(option => option.id === module)?.label ?? module;
    const values = definition.fields
        .map(field => ({ label: field.label, value: getModuleValue(inputs, module, field.id).trim() }))
        .filter(item => item.value.length > 0);

    const valueLines = values.length
        ? values.map(item => `- ${item.label}: ${item.value}`).join('\n')
        : '- No field values captured.';

    const resultLines = result
        ? [
            '',
            'Calculated output:',
            `- Summary: ${result.summary}`,
            ...(result.score ? [`- Score: ${result.score.score}/${result.score.max} ${result.score.label}`] : []),
            ...result.insights.map(item => `- ${item.title}: ${item.detail}`),
        ].join('\n')
        : '';

    return [
        `${label} module brief`,
        '',
        'Captured inputs:',
        valueLines,
        resultLines,
        '',
        'Calculation scope:',
        definition.calculationScope.map(item => `- ${item}`).join('\n'),
        '',
        'Report instruction:',
        'Use this module output as deterministic app-calculated context. Do not invent unsupported precision beyond the stated limitations.',
    ].join('\n');
}

function groupedFields(fields: ModuleField[]) {
    return fields.reduce<Record<string, ModuleField[]>>((groups, field) => {
        const section = field.section ?? 'Inputs';
        groups[section] = [...(groups[section] ?? []), field];
        return groups;
    }, {});
}

export default function OptionalModulesTabs() {
    const [active, setActive] = useState<HomeTab>('birth_chart');
    const [preferences, setPreferences] = useState<AnalysisPreferences>(DEFAULT_ANALYSIS_PREFERENCES);
    const [moduleInputs, setModuleInputs] = useState<Record<string, string>>({});
    const [moduleResults, setModuleResults] = useState<Record<string, ModuleCalculationResult>>({});
    const [validationMessage, setValidationMessage] = useState('');
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        setPreferences(readPreferences());
        setModuleInputs(readModuleInputs());
        setModuleResults(readModuleResults());
    }, []);

    const persistPreferences = (next: AnalysisPreferences) => {
        setPreferences(next);
        localStorage.setItem('analysisPreferences', JSON.stringify(next));
    };

    const persistModuleInputs = (next: Record<string, string>) => {
        setModuleInputs(next);
        localStorage.setItem('optionalModuleInputs', JSON.stringify(next));
    };

    const persistModuleResults = (next: Record<string, ModuleCalculationResult>) => {
        setModuleResults(next);
        localStorage.setItem('optionalModuleResults', JSON.stringify(next));
    };

    const toggleModule = (module: OptionalFeature) => {
        const enabled = preferences.optionalFeatures.includes(module);
        const optionalFeatures = enabled
            ? preferences.optionalFeatures.filter(feature => feature !== module)
            : [...preferences.optionalFeatures, module];
        persistPreferences({ ...preferences, optionalFeatures });
    };

    const updateInput = (module: OptionalFeature, fieldId: string, value: string) => {
        setValidationMessage('');
        persistModuleInputs({ ...moduleInputs, [moduleKey(module, fieldId)]: value });
    };

    const calculateModule = async (module: OptionalFeature) => {
        const missingRequired = getMissingRequired(module, moduleInputs);
        if (missingRequired.length > 0) {
            setValidationMessage(`Complete required fields: ${missingRequired.join(', ')}.`);
            return;
        }

        setCalculating(true);
        setValidationMessage('');
        try {
            const res = await fetch('/api/modules/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module, inputs: unscopedInputs(module, moduleInputs) }),
            });
            const payload = await res.json();
            if (!res.ok) {
                const detail = Array.isArray(payload.details)
                    ? payload.details.map((item: { field: string; message: string }) => item.message).join(' ')
                    : payload.error;
                throw new Error(detail || 'Module calculation failed');
            }

            const result = payload as ModuleCalculationResult;
            const nextResults = { ...moduleResults, [module]: result };
            persistModuleResults(nextResults);
            const nextInputs = {
                ...moduleInputs,
                [moduleKey(module, 'module_brief')]: buildModuleBrief(module, moduleInputs, result),
                [moduleKey(module, 'module_brief_updated_at')]: new Date().toISOString(),
            };
            persistModuleInputs(nextInputs);
            setValidationMessage('Calculation complete. This module is ready for independent review and main-report context.');

            if (!preferences.optionalFeatures.includes(module)) {
                persistPreferences({ ...preferences, optionalFeatures: [...preferences.optionalFeatures, module] });
            }
        } catch (error) {
            setValidationMessage(error instanceof Error ? error.message : 'Module calculation failed.');
        } finally {
            setCalculating(false);
        }
    };

    const resetModule = (module: OptionalFeature) => {
        const nextInputs = Object.fromEntries(Object.entries(moduleInputs).filter(([key]) => !key.startsWith(`${module}.`)));
        const nextResults = { ...moduleResults };
        delete nextResults[module];
        persistModuleInputs(nextInputs);
        persistModuleResults(nextResults);
        persistPreferences({ ...preferences, optionalFeatures: preferences.optionalFeatures.filter(feature => feature !== module) });
        setValidationMessage('Module inputs and result cleared.');
    };

    const optionalTabs = OPTIONAL_FEATURE_OPTIONS.map(option => ({
        id: option.id,
        label: option.label,
        icon: MODULE_DEFINITIONS[option.id].icon,
        ready: Boolean(moduleResults[option.id]),
    }));

    if (active === 'birth_chart') {
        return (
            <section className="w-full max-w-6xl mx-auto">
                <TopTabs active={active} setActive={setActive} optionalTabs={optionalTabs} preferences={preferences} />
                <div className="mt-6">
                    <BirthForm />
                </div>
            </section>
        );
    }

    const definition = MODULE_DEFINITIONS[active];
    const activeOption = OPTIONAL_FEATURE_OPTIONS.find(option => option.id === active);
    const Icon = definition.icon;
    const enabled = preferences.optionalFeatures.includes(active);
    const missingRequired = getMissingRequired(active, moduleInputs);
    const moduleBrief = moduleInputs[moduleKey(active, 'module_brief')] ?? '';
    const updatedAt = moduleInputs[moduleKey(active, 'module_brief_updated_at')];
    const result = moduleResults[active];

    return (
        <section className="w-full max-w-6xl mx-auto">
            <TopTabs active={active} setActive={setActive} optionalTabs={optionalTabs} preferences={preferences} />

            <div className="mt-4 sm:mt-6 glass-card p-3 sm:p-4 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <Icon className="h-6 w-6 text-purple-300 mt-1" />
                        <div>
                            <div className="text-xs uppercase tracking-wider text-purple-300/80 font-semibold">{definition.subtitle}</div>
                            <h2 className="text-xl font-semibold text-white/90">{activeOption?.label}</h2>
                            <p className="text-sm text-white/50 mt-1 max-w-2xl">{definition.flowGoal}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => toggleModule(active)}
                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${enabled
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                                : 'bg-white/[0.06] text-white/75 border-white/10 hover:bg-white/[0.1]'
                                }`}
                        >
                            {enabled ? 'Included in main analysis' : 'Use in main analysis'}
                        </button>
                        <button
                            type="button"
                            onClick={() => resetModule(active)}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/65 hover:bg-white/[0.08]"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-4">
                    <aside className="space-y-4">
                        <ModuleInfo title="Calculation engine" items={definition.supportedNow} tone="emerald" />
                        <ModuleInfo title="Scope and evidence" items={definition.calculationScope} tone="purple" />
                        {result && <ResultSummary result={result} compact />}
                    </aside>

                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-white/90">Independent Flow Inputs</h3>
                                <p className="text-xs text-white/45">These fields are enough to run this module without using the main birth-chart flow.</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${missingRequired.length === 0
                                ? 'bg-emerald-400/15 text-emerald-300'
                                : 'bg-amber-400/15 text-amber-300'
                                }`}>
                                {missingRequired.length === 0 ? 'Ready' : `${missingRequired.length} required`}
                            </span>
                        </div>

                        <div className="space-y-5">
                            {Object.entries(groupedFields(definition.fields)).map(([section, fields]) => (
                                <div key={section}>
                                    <h4 className="mb-3 text-xs uppercase tracking-wider text-white/40 font-semibold">{section}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {fields.map(field => (
                                            <ModuleFieldControl
                                                key={field.id}
                                                module={active}
                                                field={field}
                                                value={getModuleValue(moduleInputs, active, field.id)}
                                                onChange={updateInput}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {validationMessage && (
                            <div className="mt-4 rounded-lg border border-white/10 bg-black/15 p-3 text-sm text-white/70">
                                {validationMessage}
                            </div>
                        )}

                        <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => calculateModule(active)}
                                disabled={calculating}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-500/85 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
                            >
                                <Sparkles className="h-4 w-4" />
                                {calculating ? 'Calculating...' : 'Calculate Module'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActive('birth_chart')}
                                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.08]"
                            >
                                Go to Birth Chart
                            </button>
                        </div>

                        {result && <ResultSummary result={result} />}

                        <div className="mt-5 rounded-lg border border-white/10 bg-black/15 p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <h3 className="text-sm font-semibold text-white/85">Main Analysis Context</h3>
                                {moduleBrief && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] text-emerald-300">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Saved
                                    </span>
                                )}
                            </div>
                            {moduleBrief ? (
                                <div className="space-y-3">
                                    <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-black/25 p-3 text-xs leading-relaxed text-white/65">
                                        {moduleBrief}
                                    </pre>
                                    {updatedAt && <p className="text-[11px] text-white/35">Last updated {new Date(updatedAt).toLocaleString()}</p>}
                                </div>
                            ) : (
                                <p className="text-sm text-white/45 leading-relaxed">
                                    Run the module calculation to create a validated context brief for the detailed analysis.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ModuleFieldControl({
    module,
    field,
    value,
    onChange,
}: {
    module: OptionalFeature;
    field: ModuleField;
    value: string;
    onChange: (module: OptionalFeature, fieldId: string, value: string) => void;
}) {
    const commonLabel = (
        <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">
            {field.label}
            {field.required && <span className="text-amber-300"> *</span>}
        </span>
    );

    if (field.type === 'textarea') {
        return (
            <label className="space-y-1 md:col-span-2">
                {commonLabel}
                <textarea className="glass-input min-h-24 w-full resize-y" placeholder={field.placeholder} value={value} onChange={event => onChange(module, field.id, event.target.value)} />
                {field.helper && <span className="block text-[11px] text-white/35">{field.helper}</span>}
            </label>
        );
    }

    if (field.type === 'select') {
        return (
            <label className="space-y-1">
                {commonLabel}
                <select className="glass-input w-full bg-black/50 [color-scheme:dark]" value={value} onChange={event => onChange(module, field.id, event.target.value)}>
                    <option value="">Select</option>
                    {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {field.helper && <span className="block text-[11px] text-white/35">{field.helper}</span>}
            </label>
        );
    }

    return (
        <label className="space-y-1">
            {commonLabel}
            <input
                type={field.type ?? 'text'}
                step={field.type === 'number' ? 'any' : undefined}
                className="glass-input w-full"
                placeholder={field.placeholder}
                value={value}
                onChange={event => onChange(module, field.id, event.target.value)}
            />
            {field.helper && <span className="block text-[11px] text-white/35">{field.helper}</span>}
        </label>
    );
}

function ResultSummary({ result, compact = false }: { result: ModuleCalculationResult; compact?: boolean }) {
    const statusClass = {
        favorable: 'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200',
        neutral: 'border-white/10 bg-white/[0.03] text-white/70',
        caution: 'border-amber-400/20 bg-amber-400/[0.06] text-amber-200',
        unsupported: 'border-red-400/20 bg-red-400/[0.06] text-red-200',
    };

    if (compact) {
        return (
            <div className="rounded-lg border border-white/10 bg-black/15 p-4">
                <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-2">Latest Result</div>
                <p className="text-sm text-white/75 leading-relaxed">{result.summary}</p>
                {result.score && <p className="mt-2 text-xs text-white/45">{result.score.label}: {result.score.score}/{result.score.max}</p>}
            </div>
        );
    }

    return (
        <div className="mt-5 rounded-lg border border-white/10 bg-black/15 p-3 sm:p-4">
            <h3 className="text-base font-semibold text-white/90">{result.title}</h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">{result.summary}</p>

            {result.score && (
                <div className="mt-4 rounded-lg border border-purple-400/20 bg-purple-400/[0.06] p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span className="text-sm font-semibold text-white/85">{result.score.label}</span>
                        <span className="text-sm text-purple-200">{result.score.score}/{result.score.max}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/50">{result.score.detail}</p>
                </div>
            )}

            {result.scores && result.scores.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.scores.map(score => (
                        <div key={score.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <span className="text-xs font-semibold text-white/80">{score.label}</span>
                                <span className="text-xs text-white/50">{score.score}/{score.max}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-white/45 leading-relaxed">{score.detail}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 space-y-2">
                {result.insights.map(insight => (
                    <div key={`${insight.title}-${insight.detail}`} className={`rounded-lg border p-3 ${statusClass[insight.status]}`}>
                        <div className="text-sm font-semibold">{insight.title}</div>
                        <p className="mt-1 text-xs leading-relaxed opacity-85">{insight.detail}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                <ResultList title="Calculation Details" items={result.calculationDetails} />
                <ResultList title="Limitations" items={result.limitations} />
                <ResultList title="Next Steps" items={result.nextSteps} />
            </div>
        </div>
    );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-2">{title}</div>
            <ul className="space-y-1">
                {items.map(item => <li key={item} className="text-xs text-white/55 leading-relaxed">{item}</li>)}
            </ul>
        </div>
    );
}

function ModuleInfo({ title, items, tone }: { title: string; items: string[]; tone: 'emerald' | 'purple' }) {
    const toneClass = tone === 'emerald' ? 'text-emerald-300/80' : 'text-purple-300/80';
    return (
        <div className="rounded-lg border border-white/10 bg-black/15 p-4">
            <div className={`text-[11px] uppercase tracking-wider font-semibold mb-3 ${toneClass}`}>{title}</div>
            <ul className="space-y-2">
                {items.map(item => (
                    <li key={item} className="flex gap-2 text-sm text-white/60 leading-relaxed">
                        <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TopTabs({
    active,
    setActive,
    optionalTabs,
    preferences,
}: {
    active: HomeTab;
    setActive: (tab: HomeTab) => void;
    optionalTabs: { id: OptionalFeature; label: string; icon: ElementType; ready: boolean }[];
    preferences: AnalysisPreferences;
}) {
    return (
        <div className="glass-card p-2 sm:p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setActive('birth_chart')}
                    className={`shrink-0 min-w-[150px] rounded-lg border px-3 sm:px-4 py-3 text-left transition-colors ${active === 'birth_chart' ? 'border-purple-400/70 bg-purple-500/20' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
                >
                    <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
                        <Stars className="h-4 w-4 text-purple-300" />
                        Birth Chart
                    </span>
                    <span className="block text-[11px] text-white/40 mt-1">Core kundali flow</span>
                </button>

                {optionalTabs.map(option => {
                    const Icon = option.icon;
                    const isActive = active === option.id;
                    const isEnabled = preferences.optionalFeatures.includes(option.id);

                    return (
                        <button
                            type="button"
                            key={option.id}
                            onClick={() => setActive(option.id)}
                            className={`shrink-0 min-w-[190px] rounded-lg border px-3 sm:px-4 py-3 text-left transition-colors ${isActive ? 'border-purple-400/70 bg-purple-500/20' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
                                <Icon className="h-4 w-4 text-purple-300" />
                                {option.label}
                                {option.ready && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] text-emerald-300">Ready</span>}
                                {isEnabled && <span className="rounded-full bg-purple-400/15 px-2 py-0.5 text-[10px] text-purple-200">Included</span>}
                            </span>
                            <span className="block text-[11px] text-white/40 mt-1">Independent engine</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
