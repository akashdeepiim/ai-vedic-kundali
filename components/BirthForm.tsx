'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Globe, Search, SlidersHorizontal } from 'lucide-react';
import {
    DEFAULT_ANALYSIS_PREFERENCES,
    OPTIONAL_FEATURE_OPTIONS,
    type OptionalFeature
} from '@/lib/analysis-options';

export default function BirthForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState<OptionalFeature[]>([]);
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleFeature = (feature: OptionalFeature) => {
        setSelectedFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(item => item !== feature)
                : [...prev, feature]
        );
    };

    const handleLocationSearch = async () => {
        if (!formData.city) return;

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
                setFormData(prev => ({ ...prev, lat, lon }));

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
                        setFormData(prev => ({
                            ...prev,
                            lat,
                            lon,
                            timezone: String(tzData.offset),
                            timeZoneId: tzData.timeZoneId || prev.timeZoneId,
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch timezone:", err);
                    // Don't block flow, just let user manually pick if needed
                }

            } else {
                alert("Location not found. Please try again or enter coordinates manually.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Error fetching location. Please check your connection.");
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate basic inputs
        if (!formData.dateString || !formData.timeString || !formData.lat || !formData.lon) {
            alert("Please fill all required fields (Date, Time, Location)");
            setLoading(false);
            return;
        }

        // Save to local storage to pass to results page
        localStorage.setItem('birthDetails', JSON.stringify(formData));
        localStorage.setItem('analysisPreferences', JSON.stringify({
            ...DEFAULT_ANALYSIS_PREFERENCES,
            optionalFeatures: selectedFeatures,
        }));

        // Simulate delay for effect? No, just push.
        router.push('/kundali');
        setLoading(false);
    };

    return (
        <div className="w-full max-w-xl mx-auto p-8 glass-card animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold heading-gradient mb-2">Your Birth Chart</h2>
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

                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Birth City</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="New Delhi"
                            className="glass-input w-full"
                            value={formData.city}
                            onChange={handleChange}
                            onBlur={() => { if (formData.city && !formData.lat) handleLocationSearch() }}
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
                    onClick={handleLocationSearch}
                    disabled={isSearchingLocation || !formData.city}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs text-white/70 rounded transition-colors flex items-center justify-center gap-2"
                >
                    {isSearchingLocation ? (
                        <>Finding coordinates...</>
                    ) : (
                        <>
                            <Search className="h-3 w-3" />
                            Find Location
                        </>
                    )}
                </button>

                {/* Coordinates are editable so users can correct geocoding misses. */}
                <div className="grid grid-cols-2 gap-4 opacity-70">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/30 font-semibold ml-1">Latitude</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                                type="number"
                                step="any"
                                name="lat"
                                placeholder="Lat"
                                required
                                className="glass-input w-full pl-10"
                                value={formData.lat}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/30 font-semibold ml-1">Longitude</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                                type="number"
                                step="any"
                                name="lon"
                                placeholder="Lon"
                                required
                                className="glass-input w-full pl-10"
                                value={formData.lon}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Timezone</label>
                    <select
                        name="timezone"
                        className="glass-input w-full [color-scheme:dark] bg-black/50"
                        value={formData.timezone}
                        onChange={handleChange}
                    >
                        <option value="5.5">IST (+05:30)</option>
                        <option value="0">UTC (+00:00)</option>
                        <option value="-5">EST (-05:00)</option>
                        <option value="-4">EDT (-04:00)</option>
                        <option value="-8">PST (-08:00)</option>
                        <option value="-7">PDT (-07:00)</option>
                        <option value="1">CET (+01:00)</option>
                        <option value="2">CEST (+02:00)</option>
                        {/* Auto-detected values might not overlap options perfectly, but value binds correctly */}
                        {!["5.5", "0", "-5", "-4", "-8", "-7", "1", "2"].includes(String(formData.timezone)) && (
                            <option value={formData.timezone}>Auto: {formData.timezone}</option>
                        )}
                    </select>
                    {formData.timeZoneId && (
                        <p className="text-[11px] text-white/35">Detected: {formData.timeZoneId}</p>
                    )}
                </div>

                <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-purple-300 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-white/85">Optional modules</h3>
                            <p className="text-xs text-white/45">Choose areas you may want included later. These do not block chart generation.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {OPTIONAL_FEATURE_OPTIONS.map(option => (
                            <label
                                key={option.id}
                                className="flex items-start gap-3 rounded-md border border-white/10 bg-black/10 p-3 hover:bg-white/[0.04] cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 accent-purple-500"
                                    checked={selectedFeatures.includes(option.id)}
                                    onChange={() => toggleFeature(option.id)}
                                />
                                <span>
                                    <span className="block text-xs font-semibold text-white/80">{option.label}</span>
                                    <span className="block text-[11px] text-white/40 leading-relaxed">{option.description}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.lat}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? 'Calculating...' : 'Show My Chart'}
                </button>
            </form>
        </div>
    );
}
