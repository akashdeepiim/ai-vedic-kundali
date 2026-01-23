'use client';
import { PlanetPosition, ZodiacSign } from '@/lib/astrology/types';

interface ChartProps {
    planets: PlanetPosition[];
    ascendant: PlanetPosition;
    title: string;
}

const SIGN_POSITIONS: Record<ZodiacSign, { x: number; y: number }> = {
    'Aries': { x: 1, y: 0 },
    'Taurus': { x: 2, y: 0 },
    'Gemini': { x: 3, y: 0 },
    'Cancer': { x: 3, y: 1 },
    'Leo': { x: 3, y: 2 },
    'Virgo': { x: 3, y: 3 },
    'Libra': { x: 2, y: 3 },
    'Scorpio': { x: 1, y: 3 },
    'Sagittarius': { x: 0, y: 3 },
    'Capricorn': { x: 0, y: 2 },
    'Aquarius': { x: 0, y: 1 },
    'Pisces': { x: 0, y: 0 }
};

export default function SouthIndianChart({ planets, ascendant, title }: ChartProps) {
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
            <h3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 font-bold uppercase tracking-widest pointer-events-none">
                {title}
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

function SignContent({ sign, points }: { sign: string; points?: string[] }) {
    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex flex-wrap gap-1 content-start">
                {points?.map((p, i) => (
                    <span key={i} className={`font-bold ${p === 'Asc' ? 'text-red-400' : 'text-yellow-200'}`}>{p}</span>
                ))}
            </div>
            <span className="text-[10px] text-white/30 self-end uppercase">{sign.slice(0, 3)}</span>
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
