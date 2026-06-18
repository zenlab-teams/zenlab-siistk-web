import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { TbMapPin, TbSearch, TbX } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to recenter the map when coordinates change
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 12, { duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const LocationPicker = ({
    location = "",
    latitude = null,
    longitude = null,
    onChange,
    error = null,
    required = false,
}) => {
    const [query, setQuery] = useState(location);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);

    // Default center: Indonesia overview
    const defaultCenter = [-2.5, 118.0];
    const defaultZoom = 5;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync external location prop
    useEffect(() => {
        setQuery(location);
    }, [location]);

    const searchCity = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                format: "json",
                addressdetails: "1",
                limit: "6",
                "accept-language": "id",
            });
            const response = await fetch(`${NOMINATIM_URL}?${params}`, {
                headers: { "User-Agent": "TelatenKarya-App" },
            });
            const data = await response.json();
            setSuggestions(data);
            setShowDropdown(data.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Clear selection if user edits text
        if (value !== location) {
            onChange("", null, null);
        }

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            searchCity(value);
        }, 500);
    };

    const handleSelect = (item) => {
        const displayName = item.display_name;
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        setQuery(displayName);
        setSuggestions([]);
        setShowDropdown(false);
        onChange(displayName, lat, lng);
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        onChange("", null, null);
    };

    const mapCenter = latitude && longitude ? [latitude, longitude] : defaultCenter;
    const mapZoom = latitude && longitude ? 12 : defaultZoom;

    return (
        <div className="flex flex-col gap-3" ref={wrapperRef}>
            {/* Search Input */}
            <div className="relative">
                <label className="mb-1 block">
                    <TbMapPin className="inline text-lg mr-1 -mt-0.5" />
                    Lokasi Tujuan
                    {required && <span className="text-sm text-red-500 font-bold"> *</span>}
                </label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <TbSearch className="text-xl" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                        placeholder="Cari nama kota (misal: Surabaya, Malang, Bandung...)"
                        required={required}
                        className={`dark:bg-slate-800 w-full pl-10 pr-10 py-2 border-2 dark:border-slate-600 rounded-lg outline-none focus:border-sky-300 dark:focus:border-sky-600 transition-all ${
                            error ? "border-red-300 focus:border-red-300 dark:!border-red-800" : ""
                        }`}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-all"
                        >
                            <TbX className="text-xl" />
                        </button>
                    )}
                </div>

                {/* Loading indicator */}
                {isSearching && (
                    <div className="absolute right-10 top-[calc(50%+12px)] -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                    {showDropdown && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-[1000] w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                        >
                            {suggestions.map((item, index) => (
                                <button
                                    key={`${item.place_id}-${index}`}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="w-full text-left px-4 py-3 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all border-b last:border-b-0 border-slate-100 dark:border-slate-700"
                                >
                                    <div className="flex items-start gap-2">
                                        <TbMapPin className="text-sky-500 text-lg mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-slate-700 dark:text-slate-200">
                                                {item.display_name}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                {item.type?.replace(/_/g, " ")} · {item.class?.replace(/_/g, " ")}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        className="flex gap-1 items-center text-red-400 font-bold mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span>{error}</span>
                    </motion.div>
                )}
            </div>

            {/* Selected location display */}
            {location && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2"
                >
                    <TbMapPin className="text-emerald-500 text-lg flex-shrink-0" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                        {location}
                    </span>
                </motion.div>
            )}

            {/* Map */}
            <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700" style={{ height: "300px" }}>
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {latitude && longitude && (
                        <Marker position={[latitude, longitude]} />
                    )}
                    <RecenterMap lat={latitude} lng={longitude} />
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationPicker;
