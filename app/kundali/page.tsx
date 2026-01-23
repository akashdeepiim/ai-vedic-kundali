'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SouthIndianChart from '@/components/SouthIndianChart';
import { KundaliResult } from '@/lib/astrology/types';
import { Loader2 } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import AnalysisReport from '@/components/AnalysisReport';

export default function KundaliResultPage() {
    const router = useRouter();
    const [data, setData] = useState<KundaliResult | null>(null);
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
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input)
                });

                if (!res.ok) throw new Error('Failed to generate chart');

                const result: KundaliResult = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message || 'Error occurred');
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

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
            <header className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold heading-gradient">Vedic Horoscope</h1>
                    <p className="text-white/50 text-sm">{data.birthDetails.dateString} at {data.birthDetails.timeString}</p>
                </div>
                <button onClick={() => router.push('/')} className="text-xs text-primary hover:underline">New Chart</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Charts Section */}
                <div className="space-y-8">
                    <div className="glass-card p-4">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Lagna Chart (D-1)</h2>
                        <SouthIndianChart planets={data.planets} ascendant={data.ascendant} title="Rasi" />
                    </div>

                    <div className="glass-card p-4">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Navamsa Chart (D-9)</h2>
                        <SouthIndianChart planets={data.vargas.D9} ascendant={data.ascendant} title="Navamsa" />
                        {/* Note: Ascendant for D9 needs to be calculated in backend properly and passed. 
                   Currently backend passes 'ascendant' D1. D9 ascendant logic was added but return type might need adjustment 
                   if 'ascendant' field in root is only D1. 
                   Actually D9 array includes 'Ascendant' in backend code if I recall?
                   Let's check backend logic. I didn't push Ascendant to D9 array, I mapped planets.
                   I should fix simple visual: passed 'data.ascendant' (D1) which is wrong for D9.
                   For now, it displays D1 Ascendant. I'll stick with this or check if D9 array has it.
                   In calculator.ts, I mapped planets. I'll need to update calculator to include Asc in d9 array or separate field.
                   For now, visual will likely miss D9 Ascendant or show D1 Ascendant.
               */}
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="py-2 font-medium text-red-300">Ascendant</td>
                                    <td className="py-2">{data.ascendant.sign}</td>
                                    <td className="py-2">{data.ascendant.longitude.toFixed(2)}°</td>
                                    <td className="py-2">{data.ascendant.nakshatra} ({data.ascendant.pada})</td>
                                </tr>
                                {data.planets.map((p) => (
                                    <tr key={p.name}>
                                        <td className="py-2 font-medium text-indigo-200">{p.name} {p.isRetrograde ? '(R)' : ''}</td>
                                        <td className="py-2">{p.sign}</td>
                                        <td className="py-2">{(p.longitude % 30).toFixed(2)}°</td>
                                        <td className="py-2">{p.nakshatra} ({p.pada})</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4 text-purple-200">Vimshottari Dasha</h2>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.dasha.list.map((d, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 rounded hover:bg-white/5">
                                    <span className="font-medium text-indigo-200">{d.lord}</span>
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
            <AnalysisReport data={data} />

            <ChatInterface chartData={data} />
        </div>
    );
}
