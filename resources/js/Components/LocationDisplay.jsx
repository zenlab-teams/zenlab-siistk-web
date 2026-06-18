import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { TbMapPin } from "react-icons/tb";

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationDisplay = ({ location, latitude, longitude }) => {
    if (!location) {
        return null;
    }

    const hasCoordinates = latitude && longitude;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <TbMapPin className="text-sky-500 text-xl flex-shrink-0" />
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Lokasi Tujuan</p>
                    <p className="text-base font-medium">{location}</p>
                </div>
            </div>

            {hasCoordinates && (
                <div
                    className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700"
                    style={{ height: "250px" }}
                >
                    <MapContainer
                        center={[latitude, longitude]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                        dragging={true}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[latitude, longitude]} />
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default LocationDisplay;
