'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SouthIndianChart from '@/components/SouthIndianChart';
import { KundaliResult } from '@/lib/astrology/types';
import { Loader2 } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import AnalysisReport from '@/components/AnalysisReport';
import {
    CHART_STYLE_OPTIONS,
    DEFAULT_ANALYSIS_PREFERENCES,
    type AnalysisPreferences,
    type ChartLayoutStyle
} from '@/lib/analysis-options';

export default function KundaliResultPage() {
    const router = useRouter();
    const [data, setData] = useState<KundaliResult | null>(null);
    const [preferences, setPreferences] = useState<AnalysisPreferences>(DEFAULT_ANALYSIS_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchKundali = async () => {
            const stored = localStorage.getItem('birthDetails');
            if (!stored) {
                router.push('/');
                return;
            }

            try {
                const input = JSON.parse(stored);
                const storedPreferences = localStorage.getItem('analysisPreferences');
                if (storedPreferences) {
                    setPreferences({
                        ...DEFAULT_ANALYSIS_PREFERENCES,
                        ...JSON.parse(storedPreferences),
                    });
                }
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input)
                });

                if (!res.ok) throw new Error('Failed to generate chart');

                const result: KundaliResult = await res.json();
                setData(result);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Error occurred';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchKundali();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="animate-spin text-primary h-12 w-12" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-400">
            Error: {error}
        </div>
    );

    if (!data) return null;

    // Helper to render dignity badge
    const dignityBadge = (dignity?: string, isCombust?: boolean) => {
        if (!dignity && !isCombust) return null;
        const colors: Record<string, string> = {
            'Exalted': 'text-green-400',
            'Debilitated': 'text-red-400',
            'Own Sign': 'text-yellow-300',
            'Mooltrikona': 'text-amber-400',
            'Friendly': 'text-emerald-300',
            'Enemy': 'text-orange-400',
            'Neutral': 'text-white/40',
        };
        return (
            <span className="flex items-center gap-1">
                {dignity && <span className={`text-[10px] font-semibold ${colors[dignity] || 'text-white/40'}`}>({dignity})</span>}
                {isCombust && <span className="text-[10px] font-semibold text-orange-500">(C)</span>}
            </span>
        );
    };

    const updateChartStyle = (chartStyle: ChartLayoutStyle) => {
        setPreferences(prev => {
            const next = { ...prev, chartStyle };
            localStorage.setItem('analysisPreferences', JSON.stringify(next));
            return next;
        });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
            <header className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold heading-gradient">Vedic Horoscope</h1>
                    <p className="text-white/50 text-sm">
                        {data.birthDetails.name && <span>{data.birthDetails.name} · </span>}
                        {data.birthDetails.dateString} at {data.birthDetails.timeString}
                        {data.age !== undefined && <span className="ml-2 text-white/30">(Age: {data.age})</span>}
                    </p>
                </div>
                <button onClick={() => router.push('/')} className="text-xs text-primary hover:underline">New Chart</button>
            </header>

            {/* Current Dasha banner */}
            {data.dasha.current && (
                <div className="glass-card p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-white/70">
                        <span className="text-purple-300 font-semibold">Current Period: </span>
                        {data.dasha.current}
                    </p>
                </div>
            )}

            <div className="glass-card p-4 border-l-4 border-cyan-500">
                <h2 className="text-sm font-semibold text-cyan-200 mb-2">Current Transit Context</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/65">
                    {data.transits.summary.map(item => (
                        <p key={item}>{item}</p>
                    ))}
                </div>
                <p className="text-[11px] text-white/35 mt-3">
                    Method: {data.metadata.houseSystem}, {data.metadata.nodeType}, {data.metadata.ayanamsaModel}. These calculations still need golden-test validation before they should be treated as professional-grade astrology.
                </p>
            </div>

            <div className="glass-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-white/85">Chart Layout Style</h2>
                        <p className="text-xs text-white/45">Switch the visual layout without recalculating the chart.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {CHART_STYLE_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => updateChartStyle(option.id)}
                                className={`rounded-md border px-3 py-2 text-xs transition-colors ${preferences.chartStyle === option.id
                                    ? 'border-purple-400/60 bg-purple-500/20 text-white'
                                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07]'
                                    }`}
                                title={option.description}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Charts Section */}
                <div className="space-y-8">
                    <div className="glass-card p-4">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Lagna Chart (D-1)</h2>
                        <SouthIndianChart planets={data.planets} ascendant={data.ascendant} title="Rasi" layoutStyle={preferences.chartStyle} />
                    </div>

                    <div className="glass-card p-4">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Navamsa Chart (D-9)</h2>
                        {/* Use properly computed D9 Ascendant */}
                        <SouthIndianChart
                            planets={data.vargas.D9}
                            ascendant={data.vargas.D9Ascendant || data.ascendant}
                            title="Navamsa"
                            layoutStyle={preferences.chartStyle}
                        />
                    </div>
                </div>

                {/* Tables Section */}
                <div className="space-y-8">
                    <div className="glass-card p-6 overflow-x-auto">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Planetary Details</h2>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-white/40 uppercase border-b border-white/10">
                                <tr>
                                    <th className="py-2">Planet</th>
                                    <th className="py-2">Rashi (Sign)</th>
                                    <th className="py-2">Degree</th>
                                    <th className="py-2">Nakshatra</th>
                                    <th className="py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="py-2 font-medium text-red-300">Ascendant</td>
                                    <td className="py-2">{data.ascendant.sign}</td>
                                    <td className="py-2">{(data.ascendant.degreeInSign ?? data.ascendant.longitude % 30).toFixed(2)}°</td>
                                    <td className="py-2">{data.ascendant.nakshatra} ({data.ascendant.pada})</td>
                                    <td className="py-2"></td>
                                </tr>
                                {data.planets.map((p) => (
                                    <tr key={p.name}>
                                        <td className="py-2 font-medium text-indigo-200">{p.name} {p.isRetrograde ? '(R)' : ''}</td>
                                        <td className="py-2">{p.sign}</td>
                                        <td className="py-2">{(p.degreeInSign ?? p.longitude % 30).toFixed(2)}°</td>
                                        <td className="py-2">{p.nakshatra} ({p.pada})</td>
                                        <td className="py-2">{dignityBadge(p.dignity, p.isCombust)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Vimshottari Dasha</h2>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.dasha.list.map((d, i) => (
                                <div
                                    key={i}
                                    className={`flex justify-between items-center text-sm p-2 rounded ${d.isCurrent ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-white/5'}`}
                                >
                                    <span className={`font-medium ${d.isCurrent ? 'text-purple-300' : 'text-indigo-200'}`}>
                                        {d.lord}
                                        {d.isCurrent && <span className="ml-2 text-[10px] text-purple-400">● CURRENT</span>}
                                    </span>
                                    <span className="text-white/40 text-xs">
                                        {new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Analysis Section */}
            <AnalysisReport data={data} preferences={preferences} onPreferencesChange={setPreferences} />

            <ChatInterface chartData={data} />
        </div>
    );
}
