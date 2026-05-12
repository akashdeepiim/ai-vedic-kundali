'use client';

import { useEffect, useRef, useState } from 'react';
import type { ElementType } from 'react';
import {
    BadgeCheck,
    CalendarClock,
    ChartNoAxesCombined,
    ChevronDown,
    HeartHandshake,
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
    inputTitle: string;
    inputDescription: string;
    ctaLabel: string;
    supportedNow: string[];
    calculationScope: string[];
    fields: ModuleField[];
}

const PRIMARY_BIRTH_FIELDS: ModuleField[] = [
    { id: 'native_name', label: 'Your name', placeholder: 'Optional', section: 'Your birth details' },
    { id: 'native_date', label: 'Date of birth', type: 'date', required: true, section: 'Your birth details' },
    { id: 'native_time', label: 'Time of birth', type: 'time', required: true, section: 'Your birth details' },
    { id: 'native_city', label: 'Birth city', placeholder: 'New Delhi', required: true, section: 'Your birth details' },
    { id: 'native_country', label: 'Birth country', placeholder: 'India', required: true, section: 'Your birth details' },
];

const PARTNER_BIRTH_FIELDS: ModuleField[] = [
    { id: 'partner_name', label: 'Partner name', placeholder: 'Optional', section: 'Partner birth details' },
    { id: 'partner_date', label: 'Partner date of birth', type: 'date', required: true, section: 'Partner birth details' },
    { id: 'partner_time', label: 'Partner time of birth', type: 'time', required: true, section: 'Partner birth details' },
    { id: 'partner_city', label: 'Partner birth city', placeholder: 'Mumbai', required: true, section: 'Partner birth details' },
    { id: 'partner_country', label: 'Partner birth country', placeholder: 'India', required: true, section: 'Partner birth details' },
];

const MODULE_DEFINITIONS: Record<OptionalFeature, ModuleDefinition> = {
    kundli_matching: {
        icon: HeartHandshake,
        subtitle: 'Compatibility reading',
        flowGoal: 'Check how two birth charts align for relationship compatibility, emotional fit, and areas that may need discussion.',
        inputTitle: 'Enter both birth details',
        inputDescription: 'This reading needs both people so the match can stand on its own.',
        ctaLabel: 'Generate compatibility reading',
        supportedNow: ['Primary and partner chart generation', 'Ashtakoota scoring', 'Manglik cross-check', 'Compatibility risk summary'],
        calculationScope: ['Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi', 'Mars placement from Lagna, Moon, and Venus', 'Moon sign and nakshatra evidence'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            ...PARTNER_BIRTH_FIELDS,
            {
                id: 'relationship_stage',
                label: 'Relationship stage',
                type: 'select',
                section: 'About the relationship',
                options: ['Prospective match', 'Dating', 'Engaged', 'Married', 'Post-conflict review', 'Family-arranged match'],
            },
            { id: 'context', label: 'Main question', type: 'textarea', section: 'About the relationship', placeholder: 'What should this compatibility reading focus on?' },
        ],
    },
    panchang_muhurta: {
        icon: CalendarClock,
        subtitle: 'Panchang timing review',
        flowGoal: 'Shortlist better dates for an important activity using the event type, place, and preferred date range.',
        inputTitle: 'Enter event details',
        inputDescription: 'Choose the activity and date window you are considering.',
        ctaLabel: 'Find suitable dates',
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
        subtitle: 'Dosha review',
        flowGoal: 'Review commonly discussed dosha concerns and separate genuine caution signals from fear-based conclusions.',
        inputTitle: 'Enter birth details for the dosha check',
        inputDescription: 'The result will show caution areas in plain language and avoid fixed negative predictions.',
        ctaLabel: 'Generate dosha reading',
        supportedNow: ['Manglik from Lagna, Moon, Venus', 'Kaal Sarp containment screen', 'Sade Sati from current Saturn transit', 'Pressure score'],
        calculationScope: ['Mars relative houses', 'Rahu-Ketu axis containment', 'Transit Saturn relative to natal Moon'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            {
                id: 'dosha_type',
                label: 'Dosha concern',
                type: 'select',
                section: 'Reading focus',
                options: ['Manglik', 'Kaal Sarp', 'Sade Sati', 'Pitru', 'Nadi dosha', 'Multiple concerns', 'Not sure'],
            },
            { id: 'known_context', label: 'Anything you have heard before', type: 'textarea', section: 'Reading focus', placeholder: 'For example: someone said I am Manglik, or I am worried about Sade Sati.' },
        ],
    },
    more_varga_charts: {
        icon: ChartNoAxesCombined,
        subtitle: 'Divisional chart reading',
        flowGoal: 'Look deeper into a life area such as career, marriage, children, education, or family through supporting divisional charts.',
        inputTitle: 'Choose the life area to inspect',
        inputDescription: 'You can enter specific divisional charts if you know them, or use the suggested defaults.',
        ctaLabel: 'Generate divisional reading',
        supportedNow: ['D2, D3, D7, D10, D12, D16, D24, D30, D60 placement screens', 'Question-to-varga mapping', 'Cross-chart caution notes'],
        calculationScope: ['Sidereal longitude division', 'Planetary sign placement by varga', 'Varga strength screen'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            { id: 'requested_vargas', label: 'Divisional charts to include', placeholder: 'D10, D7, D12, D16, D24, D60', required: true, section: 'Reading focus', helper: 'Use D10 for career, D7 for children, D12 for parents, D24 for education. If unsure, use D10.' },
            {
                id: 'question_area',
                label: 'Life area',
                type: 'select',
                section: 'Reading focus',
                options: ['Career', 'Marriage', 'Children', 'Property', 'Education', 'Parents', 'Spiritual growth', 'General strength'],
            },
            { id: 'specific_question', label: 'Specific question', type: 'textarea', section: 'Reading focus', placeholder: 'What do you want this reading to clarify?' },
        ],
    },
    yoga_detection: {
        icon: BadgeCheck,
        subtitle: 'Yoga review',
        flowGoal: 'Find promising chart combinations and explain what they can support, without turning them into guaranteed outcomes.',
        inputTitle: 'Choose the yoga focus',
        inputDescription: 'Use this when you want to verify a known yoga or understand supportive combinations in the chart.',
        ctaLabel: 'Generate yoga reading',
        supportedNow: ['Gaja Kesari', 'Raja Yoga candidates', 'Dhana Yoga candidates', 'Neecha Bhanga checks', 'Activation screen'],
        calculationScope: ['House lordship', 'Kendra/trikona relations', 'Moon-Jupiter angularity', 'Debilitation cancellation checks'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            {
                id: 'yoga_family',
                label: 'Yoga family to emphasize',
                type: 'select',
                section: 'Reading focus',
                options: ['Raja Yoga', 'Dhana Yoga', 'Gaja Kesari', 'Neecha Bhanga', 'Vipreet Raja Yoga', 'Panch Mahapurush', 'Multiple', 'Not sure'],
            },
            { id: 'known_claims', label: 'Yoga claims to verify', type: 'textarea', section: 'Reading focus', placeholder: 'For example: someone told me I have Raja Yoga.' },
        ],
    },
    shadbala_ashtakavarga: {
        icon: Scale,
        subtitle: 'Strength review',
        flowGoal: 'See which planets look more supported or strained so the chart interpretation stays balanced.',
        inputTitle: 'Choose the strength focus',
        inputDescription: 'This reading is best for understanding relative strengths, weak spots, and where to be cautious.',
        ctaLabel: 'Generate strength reading',
        supportedNow: ['Planetary dignity strength', 'Combustion and retrograde flags', 'House environment adjustment', 'Current transit context'],
        calculationScope: ['Composite strength score', 'Strongest and weakest planets', 'Transit support from natal Lagna'],
        fields: [
            ...PRIMARY_BIRTH_FIELDS,
            {
                id: 'strength_focus',
                label: 'Strength focus',
                type: 'select',
                section: 'Reading focus',
                options: ['Overall chart strength', 'Career planets', 'Marriage planets', 'Health indicators', 'Wealth indicators', 'Transit support', 'Specific planet'],
            },
            { id: 'specific_planet_or_house', label: 'Specific planet or life area', placeholder: 'Saturn, Venus, career, marriage...', section: 'Reading focus' },
            { id: 'question', label: 'Question', type: 'textarea', section: 'Reading focus', placeholder: 'What do you want to understand from the strength reading?' },
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

function getMissingRequiredFields(module: OptionalFeature, inputs: Record<string, string>): ModuleField[] {
    return MODULE_DEFINITIONS[module].fields
        .filter(field => field.required && !getModuleValue(inputs, module, field.id).trim());
}

function getMissingRequired(module: OptionalFeature, inputs: Record<string, string>): string[] {
    return getMissingRequiredFields(module, inputs).map(field => field.label);
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
    const [validationTone, setValidationTone] = useState<'error' | 'success' | 'info'>('info');
    const [calculating, setCalculating] = useState(false);
    const resultRef = useRef<HTMLDivElement | null>(null);

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
        setValidationTone('info');
        persistModuleInputs({ ...moduleInputs, [moduleKey(module, fieldId)]: value });
    };

    const calculateModule = async (module: OptionalFeature) => {
        const missingRequired = getMissingRequired(module, moduleInputs);
        if (missingRequired.length > 0) {
            setValidationTone('error');
            setValidationMessage(`Please complete: ${missingRequired.join(', ')}.`);
            return;
        }

        setCalculating(true);
        setValidationMessage('');
        setValidationTone('info');
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
                throw new Error(detail || 'We could not complete this reading. Please check the details and try again.');
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
            setValidationTone('success');
            setValidationMessage('Your reading is ready. Review the summary and next steps below.');
            window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

            if (!preferences.optionalFeatures.includes(module)) {
                persistPreferences({ ...preferences, optionalFeatures: [...preferences.optionalFeatures, module] });
            }
        } catch (error) {
            setValidationTone('error');
            setValidationMessage(error instanceof Error ? error.message : 'We could not complete this reading. Please check the details and try again.');
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
        setValidationTone('info');
        setValidationMessage('This reading has been cleared.');
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
                <div className="mt-4 sm:mt-5">
                    <BirthForm />
                </div>
            </section>
        );
    }

    const definition = MODULE_DEFINITIONS[active];
    const activeOption = OPTIONAL_FEATURE_OPTIONS.find(option => option.id === active);
    const Icon = definition.icon;
    const enabled = preferences.optionalFeatures.includes(active);
    const missingRequiredFields = getMissingRequiredFields(active, moduleInputs);
    const missingRequired = missingRequiredFields.map(field => field.label);
    const missingFieldIds = new Set(missingRequiredFields.map(field => field.id));
    const result = moduleResults[active];

    return (
        <section className="w-full max-w-6xl mx-auto">
            <TopTabs active={active} setActive={setActive} optionalTabs={optionalTabs} preferences={preferences} />

            <div className="mt-4 sm:mt-5 glass-card p-3 sm:p-4 md:p-6">
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
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:py-2 sm:text-sm ${enabled
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                                : 'bg-white/[0.06] text-white/75 border-white/10 hover:bg-white/[0.1]'
                                }`}
                        >
                            {enabled ? 'Included in full report' : 'Include in full report'}
                        </button>
                        <button
                            type="button"
                            onClick={() => resetModule(active)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/65 hover:bg-white/[0.08] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Clear reading
                        </button>
                    </div>
                </div>

                <div className="mt-4 sm:mt-5">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-white/90">{definition.inputTitle}</h3>
                                <p className="text-xs text-white/45">{definition.inputDescription}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${missingRequired.length === 0
                                ? 'bg-emerald-400/15 text-emerald-300'
                                : 'bg-amber-400/15 text-amber-300'
                                }`}>
                                {missingRequired.length === 0 ? 'Ready' : `${missingRequired.length} required`}
                            </span>
                        </div>

                        <div className="space-y-4 sm:space-y-5">
                            {Object.entries(groupedFields(definition.fields)).map(([section, fields]) => (
                                <div key={section}>
                                    <h4 className="mb-3 text-xs uppercase tracking-wider text-white/40 font-semibold">{section}</h4>
                                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                                        {fields.map(field => (
                                            <ModuleFieldControl
                                                key={field.id}
                                                module={active}
                                                field={field}
                                                value={getModuleValue(moduleInputs, active, field.id)}
                                                onChange={updateInput}
                                                hasError={missingFieldIds.has(field.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {validationMessage && (
                            <div className={`mt-4 rounded-lg border p-3 text-sm ${validationTone === 'success'
                                ? 'border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100'
                                : validationTone === 'error'
                                    ? 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100'
                                    : 'border-white/10 bg-white/[0.04] text-white/70'
                                }`}>
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
                                {calculating ? 'Preparing your reading...' : definition.ctaLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActive('birth_chart')}
                                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.08]"
                            >
                                Enter birth chart details
                            </button>
                        </div>

                        {result && (
                            <div ref={resultRef}>
                                <ResultSummary result={result} />
                            </div>
                        )}
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
    hasError,
}: {
    module: OptionalFeature;
    field: ModuleField;
    value: string;
    onChange: (module: OptionalFeature, fieldId: string, value: string) => void;
    hasError?: boolean;
}) {
    const commonLabel = (
        <span className={`text-xs uppercase tracking-wider font-semibold ${hasError ? 'text-amber-200' : 'text-white/40'}`}>
            {field.label}
            {field.required && <span className="text-amber-300"> *</span>}
        </span>
    );
    const inputClass = `glass-input ${hasError ? 'border-amber-300/50 ring-1 ring-amber-300/30' : ''}`;

    if (field.type === 'textarea') {
        return (
            <label className="min-w-0 space-y-1 md:col-span-2">
                {commonLabel}
                <textarea className={`${inputClass} min-h-24 resize-y`} placeholder={field.placeholder} value={value} onChange={event => onChange(module, field.id, event.target.value)} />
                {field.helper && <span className="block text-[11px] text-white/35">{field.helper}</span>}
                {hasError && <span className="block text-[11px] text-amber-200">Required for this reading.</span>}
            </label>
        );
    }

    if (field.type === 'select') {
        return (
            <label className="min-w-0 space-y-1">
                {commonLabel}
                <select className={`${inputClass} bg-black/50 [color-scheme:dark]`} value={value} onChange={event => onChange(module, field.id, event.target.value)}>
                    <option value="">Select</option>
                    {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {field.helper && <span className="block text-[11px] text-white/35">{field.helper}</span>}
                {hasError && <span className="block text-[11px] text-amber-200">Required for this reading.</span>}
            </label>
        );
    }

    return (
        <label className="min-w-0 space-y-1">
            {commonLabel}
            <input
                type={field.type ?? 'text'}
                step={field.type === 'number' ? 'any' : undefined}
                className={inputClass}
                placeholder={field.placeholder}
                value={value}
                onChange={event => onChange(module, field.id, event.target.value)}
            />
            {field.helper && <span className="block text-[11px] text-white/35">{field.helper}</span>}
            {hasError && <span className="block text-[11px] text-amber-200">Required for this reading.</span>}
        </label>
    );
}

function ResultSummary({ result }: { result: ModuleCalculationResult }) {
    const statusClass = {
        favorable: 'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200',
        neutral: 'border-white/10 bg-white/[0.03] text-white/70',
        caution: 'border-amber-400/20 bg-amber-400/[0.06] text-amber-200',
        unsupported: 'border-red-400/20 bg-red-400/[0.06] text-red-200',
    };
    const detailedAnalysis = buildFriendlyAnalysis(result);
    const scoreExplanation = result.score ? explainScore(result.module, result.score) : '';

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
                    <p className="mt-1 text-xs text-white/50">{scoreExplanation || result.score.detail}</p>
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
                            <p className="mt-1 text-[11px] text-white/45 leading-relaxed">{explainScore(result.module, score) || score.detail}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 space-y-2">
                {result.insights.map(insight => (
                    <div key={`${insight.title}-${insight.detail}`} className={`rounded-lg border p-3 ${statusClass[insight.status]}`}>
                        <div className="text-sm font-semibold">{insight.title}</div>
                        <p className="mt-1 text-xs leading-relaxed opacity-85">{explainInsight(result.module, insight)}</p>
                    </div>
                ))}
            </div>

            <div className="mt-5 rounded-lg border border-indigo-400/20 bg-indigo-400/[0.05] p-4">
                <div className="text-[11px] uppercase tracking-wider text-indigo-200/80 font-semibold mb-2">What This Means</div>
                <h4 className="text-base font-semibold text-white/90">{detailedAnalysis.headline}</h4>
                <div className="mt-3 space-y-3">
                    {detailedAnalysis.paragraphs.map(paragraph => (
                        <p key={paragraph} className="text-sm text-white/70 leading-relaxed">{paragraph}</p>
                    ))}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ResultList title="What To Do Next" items={result.nextSteps} />
                <ResultList title="Keep In Mind" items={result.limitations} />
            </div>
        </div>
    );
}

function explainScore(module: OptionalFeature, score: ModuleScore): string {
    if (module === 'kundli_matching') {
        if (score.label === 'Total Ashtakoota') return 'A higher score means the traditional Moon-based matching factors are more supportive. Still review the low-scoring areas before making a decision.';
        return 'This is one part of the 8-factor matching method. Low scores point to topics that deserve conversation, not automatic rejection.';
    }
    if (module === 'panchang_muhurta') return 'Higher scores are better candidates for shortlisting. Final timing should still account for family, venue, and activity-specific constraints.';
    if (module === 'dosha_analysis') return 'Higher pressure means more caution signals to review. It does not mean a fixed negative outcome.';
    if (module === 'more_varga_charts') return 'This score shows how supported the requested divisional view appears in this screen.';
    if (module === 'yoga_detection') return 'Higher activation means more supportive combinations were found in this screen. It is not a promise of a specific event.';
    if (module === 'shadbala_ashtakavarga') return 'Higher scores show relatively stronger planets in this screen. Lower scores show areas to interpret carefully.';
    return score.detail;
}

function explainInsight(module: OptionalFeature, insight: ModuleInsight): string {
    if (module === 'kundli_matching') {
        if (insight.title === 'Manglik Cross-check') {
            return insight.status === 'caution'
                ? 'The Manglik comparison needs careful review by both charts rather than relying only on the headline compatibility score.'
                : 'The Manglik comparison does not show a major mismatch in this screen.';
        }
        if (insight.title === 'Market-standard Caveat') return 'Use this as a first compatibility screen. Important decisions should also consider D9, timing, temperament, and real-life context.';
    }

    if (module === 'dosha_analysis') {
        if (insight.title === 'Manglik Screen') return insight.status === 'caution'
            ? 'Mars creates a stronger relationship caution signal in this screen. Review it with the full chart before drawing conclusions.'
            : 'Mars does not create a strong Manglik caution signal in this screen.';
        if (insight.title === 'Kaal Sarp Screen') return insight.status === 'caution'
            ? 'The Rahu-Ketu pattern needs attention, but it should be judged with chart strength and timing.'
            : 'This screen does not show the classical full-containment pattern often associated with Kaal Sarp.';
        if (insight.title === 'Sade Sati Screen') return insight.status === 'caution'
            ? 'Current Saturn timing may feel heavier around responsibility, delays, or emotional pressure. Use this for planning, not fear.'
            : 'Current Saturn timing does not show an active Sade Sati phase in this screen.';
    }

    if (module === 'more_varga_charts') {
        return `${insight.title} gives supporting context for the selected life area. Use it alongside the main chart instead of reading it alone.`;
    }

    if (module === 'yoga_detection') {
        if (insight.status === 'favorable') return `${insight.title} appears as a supportive candidate. Its real impact depends on strength, timing, and the rest of the chart.`;
        if (insight.status === 'caution') return `${insight.title} needs careful review before treating it as supportive.`;
        return `${insight.title} is noted, but it is not strong enough in this screen to treat as a major promise.`;
    }

    if (module === 'shadbala_ashtakavarga') {
        if (insight.title === 'Strongest Planet') return 'This planet appears relatively well supported and can carry more weight in the reading.';
        if (insight.title === 'Weakest Planet') return 'This planet needs more careful interpretation and should not be used for strong promises without support elsewhere.';
        if (insight.title === 'Transit Support') return 'Current slow-moving planet context can change how strongly chart themes feel right now.';
    }

    return insight.detail;
}

function buildFriendlyAnalysis(result: ModuleCalculationResult): { headline: string; paragraphs: string[] } {
    const scoreText = result.score ? `${result.score.score} out of ${result.score.max}` : '';
    const cautionCount = result.insights.filter(insight => insight.status === 'caution').length;
    const favorableCount = result.insights.filter(insight => insight.status === 'favorable').length;
    const strongestInsight = result.insights.find(insight => insight.status === 'favorable') ?? result.insights[0];
    const cautionInsight = result.insights.find(insight => insight.status === 'caution');

    const moduleCopy: Record<OptionalFeature, { headline: string; intro: string }> = {
        kundli_matching: {
            headline: 'Compatibility Summary',
            intro: scoreText
                ? `The matching result is ${scoreText}. Treat this as a structured compatibility screen, not a final yes-or-no decision.`
                : 'The matching result should be read as a structured compatibility screen, not a final yes-or-no decision.',
        },
        panchang_muhurta: {
            headline: 'Timing Summary',
            intro: scoreText
                ? `The best candidate date scored ${scoreText}. This means it looks useful for shortlisting, while final timing should still consider family constraints and activity-specific rules.`
                : 'The date window has been screened so you can shortlist better timing candidates.',
        },
        dosha_analysis: {
            headline: 'Dosha Summary',
            intro: scoreText
                ? `The dosha pressure screen is ${scoreText}. A higher number means more caution flags to review, not a fixed negative outcome.`
                : 'The dosha result highlights pressure areas to review carefully without treating them as fixed outcomes.',
        },
        more_varga_charts: {
            headline: 'Varga Summary',
            intro: 'The divisional chart result shows where the requested life area needs closer attention across supporting charts.',
        },
        yoga_detection: {
            headline: 'Yoga Summary',
            intro: scoreText
                ? `The yoga activation screen is ${scoreText}. This points to how strongly the detected combinations appear in this simplified rule screen.`
                : 'The yoga result identifies candidate combinations that deserve deeper review.',
        },
        shadbala_ashtakavarga: {
            headline: 'Strength Summary',
            intro: scoreText
                ? `The strength screen is ${scoreText}. Use it to spot relatively stronger and weaker chart factors rather than as an absolute destiny score.`
                : 'The strength result helps identify which chart factors appear more supported or strained.',
        },
    };

    const copy = moduleCopy[result.module];
    const balance = cautionCount > 0
        ? `There ${cautionCount === 1 ? 'is' : 'are'} ${cautionCount} caution ${cautionCount === 1 ? 'area' : 'areas'} in the result. Start there first, because those are the parts most likely to need context, timing review, or practical judgement.`
        : `The result does not show a major caution flag in this screen. That is useful, but it should still be read alongside the full chart and the real-life question.`;
    const support = strongestInsight
        ? `The most supportive signal is "${strongestInsight.title}": ${explainInsight(result.module, strongestInsight)}`
        : 'No single supportive signal dominates the result, so read the output as a balanced review.';
    const caution = cautionInsight
        ? `The main area to handle carefully is "${cautionInsight.title}": ${explainInsight(result.module, cautionInsight)}`
        : `There ${favorableCount === 1 ? 'is' : 'are'} ${favorableCount} supportive ${favorableCount === 1 ? 'indicator' : 'indicators'} in this module. Use them as directional guidance rather than a guarantee.`;

    return {
        headline: copy.headline,
        paragraphs: [copy.intro, support, caution, balance],
    };
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const activeOptional = optionalTabs.find(option => option.id === active);
    const ActiveIcon = activeOptional?.icon;

    const selectTab = (tab: HomeTab) => {
        setActive(tab);
        setIsMenuOpen(false);
    };

    return (
        <div className="relative z-50 w-full">
            <label className="mx-auto block w-full max-w-sm sm:hidden">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/35">Reading</span>
                <select
                    value={active}
                    onChange={event => selectTab(event.target.value as HomeTab)}
                    className="glass-input h-10 w-full bg-black/50 text-sm font-semibold [color-scheme:dark]"
                >
                    <option value="birth_chart">Birth Chart</option>
                    {optionalTabs.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.label}{option.ready ? ' - ready' : ''}{preferences.optionalFeatures.includes(option.id) ? ' - included' : ''}
                        </option>
                    ))}
                </select>
            </label>

            <div className="mx-auto hidden w-fit max-w-xl gap-1.5 rounded-full border border-white/8 bg-white/[0.035] p-1 shadow-sm shadow-black/20 backdrop-blur-md sm:flex sm:items-center sm:justify-center">
                <button
                    type="button"
                    onClick={() => selectTab('birth_chart')}
                    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${active === 'birth_chart' ? 'border-purple-400/55 bg-purple-500/16 text-white' : 'border-transparent text-white/68 hover:bg-white/[0.06] hover:text-white'}`}
                >
                    <Stars className="h-3.5 w-3.5 text-purple-300" />
                    Birth Chart
                </button>

                <div className="relative min-w-0">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(open => !open)}
                        aria-expanded={isMenuOpen}
                        className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors sm:w-auto sm:min-w-[170px] ${activeOptional ? 'border-purple-400/55 bg-purple-500/16 text-white' : 'border-transparent text-white/68 hover:bg-white/[0.06] hover:text-white'}`}
                    >
                        {activeOptional ? (
                            <>
                                {ActiveIcon && <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-purple-300" />}
                                <span className="truncate">{activeOptional.label}</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                                More Readings
                            </>
                        )}
                        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/45 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute left-1/2 top-[calc(100%+0.4rem)] z-30 w-[min(88vw,280px)] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#100b18]/96 shadow-2xl shadow-black/40 backdrop-blur-xl sm:left-auto sm:right-0 sm:w-[280px] sm:translate-x-0">
                            <div className="max-h-[330px] overflow-y-auto p-1">
                                {optionalTabs.map(option => {
                                    const Icon = option.icon;
                                    const isActive = active === option.id;
                                    const isEnabled = preferences.optionalFeatures.includes(option.id);

                                    return (
                                        <button
                                            type="button"
                                            key={option.id}
                                            onClick={() => selectTab(option.id)}
                                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive ? 'bg-purple-500/18 text-white' : 'text-white/72 hover:bg-white/[0.07] hover:text-white'}`}
                                        >
                                            <Icon className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                                            <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                            {option.ready && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300" title="Ready" />}
                                            {isEnabled && <span className="h-2 w-2 shrink-0 rounded-full bg-purple-300" title="Included in full report" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
