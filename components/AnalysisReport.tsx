'use client';

import { useState } from 'react';
import { KundaliResult } from '@/lib/astrology/types';
import { Sparkles, Calendar, Sun, Moon, Star, Briefcase, Heart, Users, Volume2, Square, Activity, DollarSign, Palette, Home, History } from 'lucide-react';

interface AnalysisReportProps {
    data: KundaliResult;
}

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
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

export default function AnalysisReport({ data }: AnalysisReportProps) {
    const [report, setReport] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [playingSection, setPlayingSection] = useState<string | null>(null);
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

    const generateAnalysis = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chartData: data })
            });

            if (!res.ok) throw new Error('Failed to generate analysis');
            const result = await res.json();
            setReport(result);
        } catch (err) {
            setError('Failed to consult the stars. Please try again.');
        } finally {
            setLoading(false);
        }
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
            <div className="w-full flex justify-center py-8">
                <button
                    onClick={generateAnalysis}
                    disabled={loading}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    role="button"
                >
                    <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur-lg group-hover:opacity-100 transition-opacity duration-200 animate-pulse"></div>
                    <span className="relative flex items-center gap-2 bg-black/50 border border-white/20 backdrop-blur-xl px-6 py-3 rounded-lg hover:bg-black/70 transition-colors">
                        {loading ? 'Consulting the Stars...' : (
                            <>
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                Reveal Detailed Life Analysis & Future Outlook
                            </>
                        )}
                    </span>
                </button>
                {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>
        );
    }

    const SectionHeader = ({ title, icon: Icon, colorClass, sectionKey, text }: { title: string, icon: any, colorClass: string, sectionKey: string, text: string }) => (
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold heading-gradient text-center mb-8">Vedic Analysis Report</h2>

            <div className="grid gap-6">
                {/* Preliminary Analysis */}
                <div className="glass-card p-6 border-l-4 border-indigo-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-indigo-500/20">
                    <SectionHeader
                        title="Prarabdha (Destiny) & Personality"
                        icon={Star}
                        colorClass="text-indigo-400"
                        sectionKey="preliminary"
                        text={report.preliminary}
                    />
                    <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base">{report.preliminary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Career */}
                    <div className="glass-card p-6 border-l-4 border-emerald-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-emerald-500/20">
                        <SectionHeader
                            title="Career & Profession"
                            icon={Briefcase}
                            colorClass="text-emerald-400"
                            sectionKey="career"
                            text={report.career}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.career}</p>
                    </div>

                    {/* Wealth */}
                    <div className="glass-card p-6 border-l-4 border-yellow-600 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-yellow-600/20">
                        <SectionHeader
                            title="Wealth & Finance"
                            icon={DollarSign}
                            colorClass="text-yellow-500"
                            sectionKey="wealth"
                            text={report.wealth}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.wealth}</p>
                    </div>

                    {/* Health */}
                    <div className="glass-card p-6 border-l-4 border-red-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-red-500/20">
                        <SectionHeader
                            title="Health & Well-being"
                            icon={Activity}
                            colorClass="text-red-400"
                            sectionKey="health"
                            text={report.health}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.health}</p>
                    </div>

                    {/* Family */}
                    <div className="glass-card p-6 border-l-4 border-orange-400 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-orange-400/20">
                        <SectionHeader
                            title="Family & Home"
                            icon={Home}
                            colorClass="text-orange-300"
                            sectionKey="family"
                            text={report.family}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.family}</p>
                    </div>

                    {/* Passion */}
                    <div className="glass-card p-6 border-l-4 border-purple-400 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-purple-400/20">
                        <SectionHeader
                            title="Passion & Hobbies"
                            icon={Palette}
                            colorClass="text-purple-300"
                            sectionKey="passion"
                            text={report.passion}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.passion}</p>
                    </div>

                    {/* Love */}
                    <div className="glass-card p-6 border-l-4 border-pink-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-pink-500/20">
                        <SectionHeader
                            title="Love & Relationships"
                            icon={Heart}
                            colorClass="text-pink-400"
                            sectionKey="love"
                            text={report.love}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.love}</p>
                    </div>

                    {/* Marriage */}
                    <div className="glass-card p-6 border-l-4 border-rose-500 md:col-span-2 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-rose-500/20">
                        <SectionHeader
                            title="Marriage & Spouse"
                            icon={Users}
                            colorClass="text-rose-400"
                            sectionKey="marriage"
                            text={report.marriage}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.marriage}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today */}
                    <div className="glass-card p-6 border-l-4 border-yellow-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-yellow-500/20">
                        <SectionHeader
                            title="Daily Outlook (Today)"
                            icon={Sun}
                            colorClass="text-yellow-400"
                            sectionKey="today"
                            text={report.today}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.today}</p>
                    </div>

                    {/* Week */}
                    <div className="glass-card p-6 border-l-4 border-blue-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-blue-500/20">
                        <SectionHeader
                            title="Weekly Forecast"
                            icon={Calendar}
                            colorClass="text-blue-400"
                            sectionKey="week"
                            text={report.week}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.week}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Month */}
                    <div className="glass-card h-full p-6 border-l-4 border-purple-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-purple-500/20">
                        <SectionHeader
                            title="Monthly Overview"
                            icon={Moon}
                            colorClass="text-purple-400"
                            sectionKey="month"
                            text={report.month}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.month}</p>
                    </div>

                    {/* Year */}
                    <div className="glass-card h-full p-6 border-l-4 border-orange-500 hover:scale-[1.01] transition-transform duration-300 shadow-lg hover:shadow-orange-500/20">
                        <SectionHeader
                            title="Yearly Projections"
                            icon={Sparkles}
                            colorClass="text-orange-400"
                            sectionKey="year"
                            text={report.year}
                        />
                        <p className="text-white/80 leading-relaxed text-sm md:text-base">{report.year}</p>
                    </div>
                </div>

            </div>

            {/* Past Life Events Timeline */}
            {report.past_timeline && report.past_timeline.length > 0 && (
                <div className="glass-card p-6 border-l-4 border-slate-500 shadow-lg hover:shadow-slate-500/20">
                    <SectionHeader
                        title="Past Significant Events (Verify Accuracy)"
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
                                    <p className="text-white/70 text-sm mt-1">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Major Life Events Timeline */}
            {report.timeline && report.timeline.length > 0 && (
                <div className="glass-card p-6 border-l-4 border-cyan-500 shadow-lg hover:shadow-cyan-500/20">
                    <SectionHeader
                        title="Major Life Events Timeline (15 Years)"
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

                                <div className={`mt-2 text-white/80 text-sm leading-relaxed overflow-hidden transition-all duration-500 ${expandedEvent === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {event.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </div >
    );
}
