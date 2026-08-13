"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapaPonto, Prioridade } from "@/lib/data";

const COR: Record<Prioridade, string> = {
  alta: "#C4432C",
  media: "#D98A1F",
  baixa: "#3F8F5F",
  sem_dado: "#6B7076",
};

export default function MapaRodovia({ pontos }: { pontos: MapaPonto[] }) {
  const centro: [number, number] = [-23.49, -46.79];

  return (
    <MapContainer
      center={centro}
      zoom={11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pontos.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.centroid_lat, p.centroid_lon]}
          radius={5}
          pathOptions={{
            color: COR[p.prioridade],
            fillColor: COR[p.prioridade],
            fillOpacity: 0.85,
            weight: 1,
          }}
        >
          <Popup>
            <div className="font-sans text-sm">
              <p className="font-semibold">km {p.km_estimado.toFixed(1)}</p>
              <p className="text-xs text-asphalt-700">{p.tipo_rocada}</p>
              <p className="mt-1 text-xs uppercase tracking-wide">
                prioridade: {p.prioridade}
              </p>
              {p.dias_estimados_ate_critico !== null && (
                <p className="text-xs">
                  {p.dias_estimados_ate_critico === 0
                    ? "já crítico"
                    : `~${p.dias_estimados_ate_critico} dias até crítico`}
                </p>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
