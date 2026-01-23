
'use client';

import { useState } from 'react';
import { KundaliResult } from '@/lib/astrology/types';
import { Sparkles, Calendar, Sun, Moon, Star } from 'lucide-react';

interface AnalysisReportProps {
    data: KundaliResult;
}

interface AnalysisData {
    preliminary: string;
    today: string;
    week: string;
    month: string;
    year: string;
}

export default function AnalysisReport({ data }: AnalysisReportProps) {
    const [report, setReport] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold heading-gradient text-center mb-8">Vedic Analysis Report</h2>

            <div className="grid gap-6">
                {/* Preliminary Analysis */}
                <div className="glass-card p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-semibold text-white">Prarabdha (Destiny) & Personality</h3>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">{report.preliminary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today */}
                    <div className="glass-card p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Sun className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Daily Outlook (Today)</h3>
                        </div>
                        <p className="text-white/80 leading-relaxed text-sm">{report.today}</p>
                    </div>

                    {/* Week */}
                    <div className="glass-card p-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-6 h-6 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Weekly Forecast</h3>
                        </div>
                        <p className="text-white/80 leading-relaxed text-sm">{report.week}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Month */}
                    <div className="glass-card p-6 border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Moon className="w-6 h-6 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Monthly Overview</h3>
                        </div>
                        <p className="text-white/80 leading-relaxed text-sm">{report.month}</p>
                    </div>

                    {/* Year */}
                    <div className="glass-card p-6 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-white">Yearly Projections</h3>
                        </div>
                        <p className="text-white/80 leading-relaxed text-sm">{report.year}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
