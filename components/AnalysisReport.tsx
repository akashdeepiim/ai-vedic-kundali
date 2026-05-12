'use client';

import { useEffect, useState } from 'react';
import { KundaliResult } from '@/lib/astrology/types';
import { Sparkles, Calendar, Sun, Moon, Star, Briefcase, Heart, Users, Volume2, Square, Activity, DollarSign, Palette, Home, History, Download, Settings2, type LucideIcon } from 'lucide-react';
import {
    ANALYSIS_SYSTEM_OPTIONS,
    getAnalysisSystemLabel,
    getOptionalFeatureLabel,
    type AnalysisPreferences,
    type AnalysisSystem
} from '@/lib/analysis-options';

interface AnalysisReportProps {
    data: KundaliResult;
    preferences: AnalysisPreferences;
    onPreferencesChange: (preferences: AnalysisPreferences) => void;
}

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
}

interface PdfBlock {
    kind: 'meta' | 'section' | 'subsection' | 'body' | 'note' | 'spacer';
    text?: string;
    label?: string;
    value?: string;
}

interface AnalysisData {
    preliminary: string;
    career: string;
    health: string;
    wealth: string;
    passion: string;
    family: string;
    love: string;
    marriage: string;
    today: string;
    week: string;
    month: string;
    year: string;
    timeline?: TimelineEvent[];
    past_timeline?: TimelineEvent[];
}

const REPORT_SECTION_COUNT = 14;

function readOptionalModuleInputs(): Record<string, string> {
    const storedInputs = localStorage.getItem('optionalModuleInputs');
    if (!storedInputs) return {};

    try {
        const parsed = JSON.parse(storedInputs);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

export default function AnalysisReport({ data, preferences, onPreferencesChange }: AnalysisReportProps) {
    const [report, setReport] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [playingSection, setPlayingSection] = useState<string | null>(null);
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
    const [visibleSections, setVisibleSections] = useState(0);

    useEffect(() => {
        if (!report) return;

        setVisibleSections(0);
        const interval = window.setInterval(() => {
            setVisibleSections(prev => {
                if (prev >= REPORT_SECTION_COUNT) {
                    window.clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 180);

        return () => window.clearInterval(interval);
    }, [report]);

    const updateAnalysisSystem = (analysisSystem: AnalysisSystem) => {
        const next = { ...preferences, analysisSystem };
        onPreferencesChange(next);
        localStorage.setItem('analysisPreferences', JSON.stringify(next));
        setReport(null);
        setVisibleSections(0);
    };

    const selectedSystem = ANALYSIS_SYSTEM_OPTIONS.find(option => option.id === preferences.analysisSystem) ?? ANALYSIS_SYSTEM_OPTIONS[0];

    const generateAnalysis = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chartData: data,
                    preferences,
                    optionalModuleInputs: readOptionalModuleInputs(),
                })
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.error || 'Failed to generate analysis');
            }
            const result = await res.json();
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to consult the stars. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = () => {
        if (!report) return;
        const pdfBytes = createReportPdf({
            title: `Vedic Astra Report${data.birthDetails.name ? ` - ${data.birthDetails.name}` : ''}`,
            subtitle: `${data.birthDetails.dateString} ${data.birthDetails.timeString} | ${getAnalysisSystemLabel(preferences.analysisSystem)}`,
            blocks: buildPdfBlocks(report, data, preferences),
        });
        const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
        new Uint8Array(pdfBuffer).set(pdfBytes);
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vedic-astra-report-${data.birthDetails.name || data.birthDetails.dateString}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // TTS Handler
    const handleSpeak = (text: string, sectionKey: string) => {
        if (playingSection === sectionKey) {
            window.speechSynthesis.cancel();
            setPlayingSection(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Select Indian Voice
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
        if (indianVoice) {
            utterance.voice = indianVoice;
        }

        utterance.onend = () => setPlayingSection(null);
        window.speechSynthesis.speak(utterance);
        setPlayingSection(sectionKey);
    };

    if (!report) {
        return (
            <div className="space-y-5 py-5 sm:space-y-6 sm:py-8">
                <div className="glass-card p-4 border-l-4 border-indigo-500 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="h-5 w-5 text-indigo-300" />
                        <div>
                            <h2 className="text-lg font-semibold text-white/90">Analysis System</h2>
                            <p className="text-sm text-white/45">Choose the reading lens before generating the full report.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
                        <label className="space-y-2">
                            <span className="text-xs uppercase tracking-wider text-white/45 font-semibold">Choose system</span>
                            <select
                                value={preferences.analysisSystem}
                                onChange={event => updateAnalysisSystem(event.target.value as AnalysisSystem)}
                                className="glass-input w-full bg-black/50 [color-scheme:dark]"
                            >
                                {ANALYSIS_SYSTEM_OPTIONS.map(option => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-[11px] uppercase tracking-wider text-indigo-300/80 font-semibold mb-2">Selected Reading Style</div>
                            <h3 className="text-base font-semibold text-white/90">{selectedSystem.label}</h3>
                            <p className="text-sm text-white/60 leading-relaxed mt-2">{selectedSystem.description}</p>
                            <p className="text-xs text-white/40 leading-relaxed mt-3">
                                The report will only make claims that can be supported by the chart data available here.
                            </p>
                        </div>
                    </div>

                    {preferences.optionalFeatures.length > 0 && (
                        <div className="mt-4 rounded-lg border border-white/10 bg-black/10 p-3">
                            <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-2">Included readings</p>
                            <div className="flex flex-wrap gap-2">
                                {preferences.optionalFeatures.map(feature => (
                                    <span key={feature} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                                        {getOptionalFeatureLabel(feature)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full flex flex-col items-center justify-center">
                <button
                    onClick={generateAnalysis}
                    disabled={loading}
                    className="group relative inline-flex w-full max-w-sm items-center justify-center px-2 py-2 font-bold text-white transition-all duration-200 bg-transparent font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:w-auto sm:max-w-none sm:px-8 sm:py-4"
                    role="button"
                >
                    <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur-lg group-hover:opacity-100 transition-opacity duration-200 animate-pulse"></div>
                    <span className="relative flex w-full items-center justify-center gap-2 bg-black/50 border border-white/20 backdrop-blur-xl px-4 py-3 rounded-lg hover:bg-black/70 transition-colors sm:w-auto sm:px-6">
                        {loading ? 'Preparing your report...' : (
                            <>
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                Generate Full Analysis Report
                            </>
                        )}
                    </span>
                </button>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    const SectionHeader = ({ title, icon: Icon, colorClass, sectionKey, text }: { title: string, icon: LucideIcon, colorClass: string, sectionKey: string, text: string }) => (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Icon className={`w-6 h-6 ${colorClass}`} />
                <h3 className="text-lg font-semibold text-white/90">{title}</h3>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(text, sectionKey); }}
                className={`p-2 rounded-full transition-all duration-300 ${playingSection === sectionKey ? 'bg-white/20 text-white animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                title="Read Aloud"
            >
                {playingSection === sectionKey ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
            </button>
        </div>
    );

    const EvidenceText = ({ text }: { text: string }) => {
        const basisMatch = text.match(/(?:\*\*)?Chart basis(?:\*\*)?\s*:/i);
        const insightMatch = text.match(/(?:\*\*)?Usable insight(?:\*\*)?\s*:/i);

        if (!basisMatch || !insightMatch || insightMatch.index === undefined || basisMatch.index === undefined || insightMatch.index <= basisMatch.index) {
            return <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base">{text}</p>;
        }

        const insightStart = insightMatch.index + insightMatch[0].length;
        const preface = text.slice(0, basisMatch.index).trim();
        const insight = text.slice(insightStart).trim();

        return (
            <div className="space-y-4 text-sm md:text-base">
                {preface && <p className="text-white/70 leading-relaxed whitespace-pre-line">{preface}</p>}
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-2">Meaning For You</div>
                    <p className="text-white/85 leading-relaxed whitespace-pre-line">{insight}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold heading-gradient">Vedic Analysis Report</h2>
                    <p className="text-sm text-white/45">
                        System: {getAnalysisSystemLabel(preferences.analysisSystem)}
                        {preferences.optionalFeatures.length > 0 && ` | Optional modules: ${preferences.optionalFeatures.map(getOptionalFeatureLabel).join(', ')}`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={downloadPdf}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 hover:bg-white/[0.08]"
                >
                    <Download className="h-4 w-4" />
                    Download PDF
                </button>
            </div>

            <div className="grid gap-6">
                {/* Preliminary Analysis */}
                {visibleSections >= 1 && <div className="glass-card p-6 border-l-4 border-indigo-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-indigo-500/20 animate-in fade-in slide-in-from-bottom-2">
                    <SectionHeader
                        title="Prarabdha (Destiny) & Personality"
                        icon={Star}
                        colorClass="text-indigo-400"
                        sectionKey="preliminary"
                        text={report.preliminary}
                    />
                    <EvidenceText text={report.preliminary} />
                </div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Career */}
                    {visibleSections >= 2 && <div className="glass-card p-6 border-l-4 border-emerald-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Career & Profession"
                            icon={Briefcase}
                            colorClass="text-emerald-400"
                            sectionKey="career"
                            text={report.career}
                        />
                        <EvidenceText text={report.career} />
                    </div>}

                    {/* Wealth */}
                    {visibleSections >= 3 && <div className="glass-card p-6 border-l-4 border-yellow-600 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-yellow-600/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Wealth & Finance"
                            icon={DollarSign}
                            colorClass="text-yellow-500"
                            sectionKey="wealth"
                            text={report.wealth}
                        />
                        <EvidenceText text={report.wealth} />
                    </div>}

                    {/* Health */}
                    {visibleSections >= 4 && <div className="glass-card p-6 border-l-4 border-red-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-red-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Health & Well-being"
                            icon={Activity}
                            colorClass="text-red-400"
                            sectionKey="health"
                            text={report.health}
                        />
                        <EvidenceText text={report.health} />
                    </div>}

                    {/* Family */}
                    {visibleSections >= 5 && <div className="glass-card p-6 border-l-4 border-orange-400 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-orange-400/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Family & Home"
                            icon={Home}
                            colorClass="text-orange-300"
                            sectionKey="family"
                            text={report.family}
                        />
                        <EvidenceText text={report.family} />
                    </div>}

                    {/* Passion */}
                    {visibleSections >= 6 && <div className="glass-card p-6 border-l-4 border-purple-400 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-purple-400/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Passion & Hobbies"
                            icon={Palette}
                            colorClass="text-purple-300"
                            sectionKey="passion"
                            text={report.passion}
                        />
                        <EvidenceText text={report.passion} />
                    </div>}

                    {/* Love */}
                    {visibleSections >= 7 && <div className="glass-card p-6 border-l-4 border-pink-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-pink-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Love & Relationships"
                            icon={Heart}
                            colorClass="text-pink-400"
                            sectionKey="love"
                            text={report.love}
                        />
                        <EvidenceText text={report.love} />
                    </div>}

                    {/* Marriage */}
                    {visibleSections >= 8 && <div className="glass-card p-6 border-l-4 border-rose-500 md:col-span-2 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-rose-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Marriage & Spouse"
                            icon={Users}
                            colorClass="text-rose-400"
                            sectionKey="marriage"
                            text={report.marriage}
                        />
                        <EvidenceText text={report.marriage} />
                    </div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today */}
                    {visibleSections >= 9 && <div className="glass-card p-6 border-l-4 border-yellow-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-yellow-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Daily Outlook (Today)"
                            icon={Sun}
                            colorClass="text-yellow-400"
                            sectionKey="today"
                            text={report.today}
                        />
                        <EvidenceText text={report.today} />
                    </div>}

                    {/* Week */}
                    {visibleSections >= 10 && <div className="glass-card p-6 border-l-4 border-blue-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-blue-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Weekly Forecast"
                            icon={Calendar}
                            colorClass="text-blue-400"
                            sectionKey="week"
                            text={report.week}
                        />
                        <EvidenceText text={report.week} />
                    </div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Month */}
                    {visibleSections >= 11 && <div className="glass-card h-full p-6 border-l-4 border-purple-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-purple-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Monthly Overview"
                            icon={Moon}
                            colorClass="text-purple-400"
                            sectionKey="month"
                            text={report.month}
                        />
                        <EvidenceText text={report.month} />
                    </div>}

                    {/* Year */}
                    {visibleSections >= 12 && <div className="glass-card h-full p-6 border-l-4 border-orange-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-orange-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <SectionHeader
                            title="Yearly Projections"
                            icon={Sparkles}
                            colorClass="text-orange-400"
                            sectionKey="year"
                            text={report.year}
                        />
                        <EvidenceText text={report.year} />
                    </div>}
                </div>

            </div>

            {/* Past Windows Timeline */}
            {visibleSections >= 13 && report.past_timeline && report.past_timeline.length > 0 && (
                <div className="glass-card p-6 border-l-4 border-slate-500 shadow-lg hover:shadow-slate-500/20 animate-in fade-in slide-in-from-bottom-2">
                    <SectionHeader
                        title="Past Windows To Verify"
                        icon={History}
                        colorClass="text-slate-400"
                        sectionKey="past_timeline"
                        text={report.past_timeline.map(e => `${e.year}: ${e.title}. ${e.description}`).join('. ')}
                    />
                    <div className="space-y-4">
                        {report.past_timeline.map((event, index) => (
                            <div
                                key={index}
                                className="relative pl-6 border-l-2 border-white/10 hover:border-slate-400/50 hover:bg-white/5 transition-all duration-300 rounded-r-lg p-3"
                            >
                                <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 bg-slate-700 border-white/20"></div>
                                <div className="flex flex-col">
                                    <span className="text-slate-300 font-mono text-sm font-bold">{event.year}</span>
                                    <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                                    <div className="mt-3">
                                        <EvidenceText text={event.description} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Future Windows Timeline */}
            {visibleSections >= 14 && report.timeline && report.timeline.length > 0 && (
                <div className="glass-card p-6 border-l-4 border-cyan-500 shadow-lg hover:shadow-cyan-500/20 animate-in fade-in slide-in-from-bottom-2">
                    <SectionHeader
                        title="Future Windows Timeline"
                        icon={Calendar}
                        colorClass="text-cyan-400"
                        sectionKey="timeline"
                        text={report.timeline.map(e => `${e.year}: ${e.title}. ${e.description}`).join('. ')}
                    />
                    <div className="space-y-4">
                        {report.timeline.map((event, index) => (
                            <div
                                key={index}
                                onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
                                className={`relative pl-6 border-l-2 ${expandedEvent === index ? 'border-cyan-400 bg-white/5' : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/5'} transition-all duration-300 cursor-pointer rounded-r-lg p-3`}
                            >
                                <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 ${expandedEvent === index ? 'bg-cyan-500 border-cyan-300' : 'bg-slate-900 border-white/20'}`}></div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-cyan-300 font-mono text-sm font-bold">{event.year}</span>
                                        <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                                    </div>
                                    <span className="text-white/40 text-xs">{expandedEvent === index ? 'Collapse' : 'Expand'}</span>
                                </div>

                                <div className={`mt-2 overflow-hidden transition-all duration-500 ${expandedEvent === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <EvidenceText text={event.description} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

    );
}

function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function wrapText(text: string, width = 92): string[] {
    const words = stripMarkdown(text).split(' ');
    const lines: string[] = [];
    let current = '';

    words.forEach(word => {
        if ((current + ' ' + word).trim().length > width) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = `${current} ${word}`.trim();
        }
    });

    if (current) lines.push(current);
    return lines;
}

function pushSection(blocks: PdfBlock[], title: string, body: string) {
    blocks.push({ kind: 'section', text: title });
    blocks.push({ kind: 'body', text: body });
}

function buildPdfBlocks(report: AnalysisData, data: KundaliResult, preferences: AnalysisPreferences): PdfBlock[] {
    const blocks: PdfBlock[] = [
        { kind: 'meta', label: 'Name', value: data.birthDetails.name || 'Not provided' },
        { kind: 'meta', label: 'Birth', value: `${data.birthDetails.dateString} ${data.birthDetails.timeString}` },
        { kind: 'meta', label: 'Reading style', value: getAnalysisSystemLabel(preferences.analysisSystem) },
        { kind: 'meta', label: 'Chart layout', value: preferences.chartStyle },
        { kind: 'meta', label: 'Current period', value: data.dasha.current || 'Not available' },
    ];

    if (preferences.optionalFeatures.length > 0) {
        blocks.push({ kind: 'meta', label: 'Included readings', value: preferences.optionalFeatures.map(getOptionalFeatureLabel).join(', ') });
    }

    blocks.push({ kind: 'spacer' });
    pushSection(blocks, 'Prarabdha and Personality', report.preliminary);
    pushSection(blocks, 'Career and Profession', report.career);
    pushSection(blocks, 'Wealth and Finance', report.wealth);
    pushSection(blocks, 'Health and Well-being', report.health);
    pushSection(blocks, 'Family and Home', report.family);
    pushSection(blocks, 'Passion and Hobbies', report.passion);
    pushSection(blocks, 'Love and Relationships', report.love);
    pushSection(blocks, 'Marriage and Spouse', report.marriage);
    pushSection(blocks, 'Daily Outlook', report.today);
    pushSection(blocks, 'Weekly Forecast', report.week);
    pushSection(blocks, 'Monthly Overview', report.month);
    pushSection(blocks, 'Yearly Projection', report.year);

    if (report.past_timeline?.length) {
        blocks.push({ kind: 'section', text: 'Past Windows To Verify' });
        report.past_timeline.forEach(item => {
            blocks.push({ kind: 'subsection', text: `${item.year} - ${item.title}` });
            blocks.push({ kind: 'body', text: item.description });
        });
    }

    if (report.timeline?.length) {
        blocks.push({ kind: 'section', text: 'Future Windows Timeline' });
        report.timeline.forEach(item => {
            blocks.push({ kind: 'subsection', text: `${item.year} - ${item.title}` });
            blocks.push({ kind: 'body', text: item.description });
        });
    }

    blocks.push({
        kind: 'note',
        text: 'Reading note: This report is a guided astrology interpretation based on the available chart data. Use it for reflection and planning, not as a substitute for professional, medical, legal, financial, or safety advice.',
    });

    return blocks;
}

function escapePdfText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[^\x20-\x7E]/g, '');
}

function createReportPdf({ title, subtitle, blocks }: { title: string; subtitle: string; blocks: PdfBlock[] }): Uint8Array {
    const pageHeight = 842;
    const marginX = 48;
    const bottomY = 56;
    const contentWidth = 88;
    const pages: string[][] = [[]];
    let y = 790;

    const currentPage = () => pages[pages.length - 1];
    const newPage = () => {
        pages.push([]);
        y = 790;
    };
    const ensureSpace = (needed: number) => {
        if (y - needed < bottomY) newPage();
    };
    const drawText = (text: string, x: number, currentY: number, size: number, font = 'F1') => {
        currentPage().push(`BT /${font} ${size} Tf ${x} ${currentY} Td (${escapePdfText(text)}) Tj ET`);
    };
    const drawWrapped = (text: string, size: number, lineHeight: number, font = 'F1', width = contentWidth) => {
        const lines = wrapText(text, width);
        ensureSpace(lines.length * lineHeight + 6);
        lines.forEach(line => {
            drawText(line, marginX, y, size, font);
            y -= lineHeight;
        });
        y -= 4;
    };

    drawText(title, marginX, y, 18, 'F2');
    y -= 20;
    drawText(subtitle, marginX, y, 10, 'F1');
    y -= 26;

    blocks.forEach(block => {
        if (block.kind === 'spacer') {
            y -= 8;
            return;
        }

        if (block.kind === 'meta') {
            ensureSpace(16);
            drawText(`${block.label}: ${block.value}`, marginX, y, 10, 'F1');
            y -= 14;
            return;
        }

        if (block.kind === 'section') {
            ensureSpace(34);
            y -= 8;
            drawText(block.text ?? '', marginX, y, 13, 'F2');
            y -= 18;
            return;
        }

        if (block.kind === 'subsection') {
            ensureSpace(24);
            drawText(block.text ?? '', marginX, y, 10, 'F2');
            y -= 14;
            return;
        }

        if (block.kind === 'note') {
            y -= 6;
            drawWrapped(block.text ?? '', 9, 12, 'F1', 92);
            return;
        }

        drawWrapped(block.text ?? '', 10, 13);
    });

    const objects: string[] = [];
    const addObject = (body: string) => {
        objects.push(body);
        return objects.length;
    };

    const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
    const pageIds: number[] = [];
    const fontId = 3;
    const boldFontId = 4;

    addObject(''); // Pages placeholder
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    pages.forEach((pageCommands, index) => {
        const commands = [
            ...pageCommands,
            `BT /F1 8 Tf ${marginX} 28 Td (${escapePdfText(`Page ${index + 1} of ${pages.length}`)}) Tj ET`,
        ].join('\n');

        const contentId = addObject(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`);
        const pageId = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        pageIds.push(pageId);
    });

    objects[1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    objects.forEach((body, index) => {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new TextEncoder().encode(pdf);
}
