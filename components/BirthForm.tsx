'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Search, Sparkles } from 'lucide-react';
import { DEFAULT_ANALYSIS_PREFERENCES } from '@/lib/analysis-options';

export default function BirthForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [formError, setFormError] = useState('');
    const [locationConfirmed, setLocationConfirmed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dateString: '',
        timeString: '',
        city: '',
        country: '',
        lat: '',
        lon: '',
        timezone: '5.5', // Default IST
        timeZoneId: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormError('');
        if (name === 'city' || name === 'country') {
            setFormData({ ...formData, [name]: value, lat: '', lon: '', timeZoneId: '' });
            setLocationConfirmed(false);
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const resolveLocation = async () => {
        if (!formData.city.trim() || !formData.country.trim()) {
            setFormError('Please enter both birth city and country so we can find the right place.');
            return null;
        }

        setIsSearchingLocation(true);
        setFormError('');
        try {
            const query = `${formData.city}, ${formData.country}`;
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                headers: {
                    'User-Agent': 'VedicAstra/1.0'
                }
            });
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const baseResolved = { ...formData, lat, lon };
                setFormData(baseResolved);

                // Fetch Timezone automatically
                try {
                    const tzRes = await fetch('/api/timezone', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            lat,
                            lon,
                            dateString: formData.dateString,
                            timeString: formData.timeString
                        })
                    });
                    const tzData = await tzRes.json();
                    if (tzData.offset !== undefined) {
                        const resolved = {
                            ...baseResolved,
                            lat,
                            lon,
                            timezone: String(tzData.offset),
                            timeZoneId: tzData.timeZoneId || baseResolved.timeZoneId,
                        };
                        setFormData(resolved);
                        setLocationConfirmed(true);
                        return resolved;
                    }
                } catch (err) {
                    console.error("Failed to fetch timezone:", err);
                }

                setLocationConfirmed(true);
                return baseResolved;
            } else {
                setFormError("We couldn't find that place. Please check the spelling or add a nearby larger city.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            setFormError("We couldn't check the location right now. Please try again in a moment.");
        } finally {
            setIsSearchingLocation(false);
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.dateString || !formData.timeString || !formData.city.trim() || !formData.country.trim()) {
            setFormError('Please complete date of birth, time of birth, birth city, and country.');
            setLoading(false);
            return;
        }

        const readyData = formData.lat && formData.lon ? formData : await resolveLocation();
        if (!readyData?.lat || !readyData?.lon) {
            setLoading(false);
            return;
        }

        // Save to local storage to pass to results page
        localStorage.setItem('birthDetails', JSON.stringify(readyData));
        const storedPreferences = localStorage.getItem('analysisPreferences');
        const preferences = storedPreferences
            ? { ...DEFAULT_ANALYSIS_PREFERENCES, ...JSON.parse(storedPreferences) }
            : DEFAULT_ANALYSIS_PREFERENCES;
        localStorage.setItem('analysisPreferences', JSON.stringify(preferences));

        // Simulate delay for effect? No, just push.
        router.push('/kundali');
        setLoading(false);
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8 glass-card animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-5 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold heading-gradient mb-1.5 sm:mb-2">Your Birth Chart</h2>
                <p className="text-white/60 text-sm">Enter your birth details to create your chart</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="min-w-0 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Your Name</label>
                    <div className="relative min-w-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Sparkles className="h-4 w-4 text-white/40" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="glass-input w-full pl-10"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="min-w-0 space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth Date <span className="text-amber-300">*</span></label>
                        <div className="relative min-w-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                                type="date"
                                name="dateString"
                                className="glass-input pl-10 pr-3 [color-scheme:dark]"
                                value={formData.dateString}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="min-w-0 space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth Time <span className="text-amber-300">*</span></label>
                        <div className="relative min-w-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                                type="time"
                                name="timeString"
                                className="glass-input pl-10 pr-3 [color-scheme:dark]"
                                value={formData.timeString}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Location Search Section */}
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="min-w-0 space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth City <span className="text-amber-300">*</span></label>
                        <input
                            type="text"
                            name="city"
                            placeholder="New Delhi"
                            className="glass-input w-full"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="min-w-0 space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Country <span className="text-amber-300">*</span></label>
                        <input
                            type="text"
                            name="country"
                            placeholder="India"
                            className="glass-input w-full"
                            value={formData.country}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={resolveLocation}
                    disabled={isSearchingLocation || !formData.city.trim() || !formData.country.trim()}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs text-white/70 rounded transition-colors flex items-center justify-center gap-2"
                >
                    {isSearchingLocation ? (
                        <>Finding location...</>
                    ) : (
                        <>
                            <Search className="h-3 w-3" />
                            Check birth place
                        </>
                    )}
                </button>
                {locationConfirmed && formData.lat && formData.lon && (
                    <p className="text-center text-[11px] text-emerald-300/75">Birth place confirmed.</p>
                )}
                {formError && (
                    <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-100">
                        {formError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || isSearchingLocation}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2 sm:mt-4"
                >
                    {loading ? 'Calculating...' : 'Show My Chart'}
                </button>
            </form>
        </div>
    );
}
