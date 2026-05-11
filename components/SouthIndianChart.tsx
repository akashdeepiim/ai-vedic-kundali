'use client';
import { PlanetPosition } from '@/lib/astrology/types';
import type { ChartLayoutStyle } from '@/lib/analysis-options';

interface ChartProps {
    planets: PlanetPosition[];
    ascendant: PlanetPosition;
    title: string;
    layoutStyle?: ChartLayoutStyle;
}

const SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_ABBR: Record<string, string> = {
    Aries: 'Ari',
    Taurus: 'Tau',
    Gemini: 'Gem',
    Cancer: 'Can',
    Leo: 'Leo',
    Virgo: 'Vir',
    Libra: 'Lib',
    Scorpio: 'Sco',
    Sagittarius: 'Sag',
    Capricorn: 'Cap',
    Aquarius: 'Aqu',
    Pisces: 'Pis',
};

export default function SouthIndianChart({ planets, ascendant, title, layoutStyle = 'south' }: ChartProps) {
    if (layoutStyle === 'north') {
        return <NorthIndianChart planets={planets} ascendant={ascendant} title={title} />;
    }

    if (layoutStyle === 'east') {
        return <EastIndianChart planets={planets} ascendant={ascendant} title={title} />;
    }

    return <SouthChart planets={planets} ascendant={ascendant} title={title} />;
}

function SouthChart({ planets, ascendant, title }: ChartProps) {
    // Combine planets and ascendant
    const allPoints = [...planets, ascendant];

    // Group by sign
    const pointsBySign: Record<string, string[]> = {};
    allPoints.forEach(p => {
        if (!pointsBySign[p.sign]) pointsBySign[p.sign] = [];
        const symbol = getPlanetSymbol(p.name);
        pointsBySign[p.sign].push(symbol);
    });

    return (
        <div className="w-full aspect-square max-w-[400px] mx-auto bg-white/5 border border-white/10 relative text-xs">
            <h3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 font-bold uppercase tracking-widest pointer-events-none text-center">
                {title}<br />South
            </h3>

            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                {/* We only render boxes for the border cells */}
                {/* Row 0 */}
                <div className="border border-white/10 relative p-1"><SignContent sign="Pisces" points={pointsBySign['Pisces']} /></div>
                <div className="border border-white/10 relative p-1"><SignContent sign="Aries" points={pointsBySign['Aries']} /></div>
                <div className="border border-white/10 relative p-1"><SignContent sign="Taurus" points={pointsBySign['Taurus']} /></div>
                <div className="border border-white/10 relative p-1"><SignContent sign="Gemini" points={pointsBySign['Gemini']} /></div>

                {/* Row 1 */}
                <div className="border border-white/10 relative p-1"><SignContent sign="Aquarius" points={pointsBySign['Aquarius']} /></div>
                <div className="col-span-2 row-span-2"></div> {/* Center Empty */}
                <div className="border border-white/10 relative p-1"><SignContent sign="Cancer" points={pointsBySign['Cancer']} /></div>

                {/* Row 2 */}
                <div className="border border-white/10 relative p-1 col-start-1 row-start-3"><SignContent sign="Capricorn" points={pointsBySign['Capricorn']} /></div>
                {/* Center already spanned */}
                <div className="border border-white/10 relative p-1 col-start-4 row-start-3"><SignContent sign="Leo" points={pointsBySign['Leo']} /></div>

                {/* Row 3 */}
                <div className="border border-white/10 relative p-1 col-start-1 row-start-4"><SignContent sign="Sagittarius" points={pointsBySign['Sagittarius']} /></div>
                <div className="border border-white/10 relative p-1 col-start-2 row-start-4"><SignContent sign="Scorpio" points={pointsBySign['Scorpio']} /></div>
                <div className="border border-white/10 relative p-1 col-start-3 row-start-4"><SignContent sign="Libra" points={pointsBySign['Libra']} /></div>
                <div className="border border-white/10 relative p-1 col-start-4 row-start-4"><SignContent sign="Virgo" points={pointsBySign['Virgo']} /></div>
            </div>
        </div>
    );
}

function NorthIndianChart({ planets, ascendant, title }: ChartProps) {
    const allPoints = [...planets, ascendant];
    const pointsByHouse: Record<number, string[]> = {};
    allPoints.forEach(p => {
        if (!pointsByHouse[p.house]) pointsByHouse[p.house] = [];
        pointsByHouse[p.house].push(getPlanetSymbol(p.name));
    });

    const signByHouse = Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => {
            const house = i + 1;
            const signIndex = (SIGNS.indexOf(ascendant.sign) + i) % 12;
            return [house, SIGNS[signIndex]];
        })
    ) as Record<number, string>;

    const positions: Record<number, string> = {
        1: 'left-[42%] top-[5%]',
        2: 'left-[68%] top-[8%]',
        3: 'left-[82%] top-[31%]',
        4: 'left-[68%] top-[54%]',
        5: 'left-[82%] top-[78%]',
        6: 'left-[54%] top-[82%]',
        7: 'left-[42%] top-[58%]',
        8: 'left-[18%] top-[82%]',
        9: 'left-[5%] top-[58%]',
        10: 'left-[18%] top-[34%]',
        11: 'left-[5%] top-[10%]',
        12: 'left-[30%] top-[30%]',
    };

    return (
        <div className="w-full aspect-square max-w-[400px] mx-auto bg-white/5 border border-white/10 relative overflow-hidden text-xs">
            <svg className="absolute inset-0 h-full w-full text-white/15" viewBox="0 0 100 100" aria-hidden="true">
                <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.7" />
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="0.7" />
                <path d="M0 0 L100 100 M100 0 L0 100 M50 0 L50 100 M0 50 L100 50" fill="none" stroke="currentColor" strokeWidth="0.7" />
            </svg>
            <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/20 font-bold uppercase tracking-widest pointer-events-none">
                {title}<br />North
            </h3>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(house => (
                <div key={house} className={`absolute w-[22%] min-h-[16%] ${positions[house]}`}>
                    <HouseContent
                        label={`H${house}`}
                        sign={signByHouse[house]}
                        points={pointsByHouse[house]}
                    />
                </div>
            ))}
        </div>
    );
}

function EastIndianChart({ planets, ascendant, title }: ChartProps) {
    const allPoints = [...planets, ascendant];
    const pointsBySign: Record<string, string[]> = {};
    allPoints.forEach(p => {
        if (!pointsBySign[p.sign]) pointsBySign[p.sign] = [];
        pointsBySign[p.sign].push(getPlanetSymbol(p.name));
    });

    const cells = [
        'Pisces', 'Aries', 'Taurus', 'Gemini',
        'Aquarius', 'Asc', 'Center', 'Cancer',
        'Capricorn', 'Mid', 'Mid2', 'Leo',
        'Sagittarius', 'Scorpio', 'Libra', 'Virgo',
    ];

    return (
        <div className="w-full aspect-square max-w-[400px] mx-auto bg-white/5 border border-white/10 relative text-xs">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                {cells.map((cell, index) => {
                    if (['Center', 'Mid', 'Mid2', 'Asc'].includes(cell)) {
                        return (
                            <div key={`${cell}-${index}`} className="border border-white/10 flex items-center justify-center text-white/15 font-bold uppercase tracking-widest">
                                {cell === 'Asc' ? `${title} East` : ''}
                            </div>
                        );
                    }

                    return (
                        <div key={cell} className={`border border-white/10 relative p-1 ${cell === ascendant.sign ? 'bg-purple-500/10' : ''}`}>
                            <SignContent sign={cell} points={pointsBySign[cell]} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SignContent({ sign, points }: { sign: string; points?: string[] }) {
    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex flex-wrap gap-1 content-start">
                {points?.map((p, i) => (
                    <span key={i} className={`font-bold ${p === 'Asc' ? 'text-red-400' : 'text-yellow-200'}`}>{p}</span>
                ))}
            </div>
            <span className="text-[10px] text-white/30 self-end uppercase">{SIGN_ABBR[sign] || sign.slice(0, 3)}</span>
        </div>
    );
}

function HouseContent({ label, sign, points }: { label: string; sign: string; points?: string[] }) {
    return (
        <div className="h-full rounded bg-black/10 p-1">
            <div className="flex justify-between text-[9px] text-white/35">
                <span>{label}</span>
                <span>{SIGN_ABBR[sign]}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
                {points?.map((p, i) => (
                    <span key={i} className={`font-bold ${p === 'Asc' ? 'text-red-400' : 'text-yellow-200'}`}>{p}</span>
                ))}
            </div>
        </div>
    );
}

function getPlanetSymbol(name: string): string {
    const map: Record<string, string> = {
        'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
        'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra',
        'Ketu': 'Ke', 'Ascendant': 'Asc', 'Uranus': 'Ur', 'Neptune': 'Ne', 'Pluto': 'Pl'
    };
    return map[name] || name.slice(0, 2);
}
