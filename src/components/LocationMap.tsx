"use client";

import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function LocationMap({
  lat,
  lng,
  distrito,
  zonaReferencial,
  radiusMeters = 500,
}: {
  lat: number;
  lng: number;
  distrito: string;
  zonaReferencial: string;
  radiusMeters?: number;
}) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  }, []);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl ring-1 ring-ink-100">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-48 w-full max-w-full sm:h-56"
        style={{ minHeight: 192 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[lat, lng]}
          radius={radiusMeters}
          pathOptions={{ color: "#1F6B4A", fillColor: "#1F6B4A", fillOpacity: 0.12, weight: 2 }}
        />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
      <p className="bg-white px-3 py-2 text-xs text-ink-400">
        {distrito} · {zonaReferencial} · ubicación aproximada (~{radiusMeters} m). La dirección exacta
        no se publica por seguridad.
      </p>
    </div>
  );
}
