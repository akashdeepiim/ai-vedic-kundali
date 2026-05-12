'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Search } from 'lucide-react';
import { DEFAULT_ANALYSIS_PREFERENCES } from '@/lib/analysis-options';

export default function BirthForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
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
        if (name === 'city' || name === 'country') {
            setFormData({ ...formData, [name]: value, lat: '', lon: '', timeZoneId: '' });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const resolveLocation = async () => {
        if (!formData.city.trim()) return null;

        setIsSearchingLocation(true);
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
                        return resolved;
                    }
                } catch (err) {
                    console.error("Failed to fetch timezone:", err);
                }

                return baseResolved;
            } else {
                alert("Location not found. Please check the city and country.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Error fetching location. Please check your connection.");
        } finally {
            setIsSearchingLocation(false);
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.dateString || !formData.timeString || !formData.city) {
            alert("Please fill all required fields (Date, Time, City)");
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
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold heading-gradient mb-2">Your Birth Chart</h2>
                <p className="text-white/60 text-sm">Enter your details below to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Your Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-white/40">✨</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                                type="date"
                                name="dateString"
                                required
                                className="glass-input w-full pl-10 [color-scheme:dark]"
                                value={formData.dateString}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth Time</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                                type="time"
                                name="timeString"
                                required
                                className="glass-input w-full pl-10 [color-scheme:dark]"
                                value={formData.timeString}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Location Search Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth City</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="New Delhi"
                            className="glass-input w-full"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Country</label>
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
                    disabled={isSearchingLocation || !formData.city}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs text-white/70 rounded transition-colors flex items-center justify-center gap-2"
                >
                    {isSearchingLocation ? (
                        <>Finding location...</>
                    ) : (
                        <>
                            <Search className="h-3 w-3" />
                            Confirm Location
                        </>
                    )}
                </button>
                {formData.lat && formData.lon && (
                    <p className="text-center text-[11px] text-emerald-300/75">Location confirmed. Coordinates and timezone are handled automatically.</p>
                )}

                <button
                    type="submit"
                    disabled={loading || isSearchingLocation}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? 'Calculating...' : 'Show My Chart'}
                </button>
            </form>
        </div>
    );
}
