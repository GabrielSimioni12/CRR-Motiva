"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import { MapaPonto, Prioridade } from "@/lib/data";

const COR: Record<Prioridade, string> = {
  alta: "#C4432C",
  media: "#D98A1F",
  baixa: "#3F8F5F",
  sem_dado: "#6B7076",
};

interface Props {
  pontos: (MapaPonto & { id: number })[];
  selecionadoId: number | null;
  onSelecionar: (ponto: MapaPonto & { id: number }) => void;
}

export default function MapaRodovia({ pontos, selecionadoId, onSelecionar }: Props) {
  const centro: [number, number] = [-23.49, -46.79];
  const [tilesComErro, setTilesComErro] = useState(false);

  return (
    <div className="relative h-full w-full">
      {tilesComErro && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex justify-center p-2">
          <p className="border border-route-media/50 bg-asphalt-900/90 px-3 py-1.5 font-mono text-[11px] text-route-media">
            falha ao carregar o mapa-base (OpenStreetMap) — verifique sua conexão
          </p>
        </div>
      )}
      <MapContainer
        center={centro}
        zoom={11}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTilesComErro(true) }}
        />
        {pontos.map((p) => {
          const selecionado = p.id === selecionadoId;
          return (
            <CircleMarker
              key={p.id}
              center={[p.centroid_lat, p.centroid_lon]}
              radius={selecionado ? 8 : 5}
              pathOptions={{
                color: selecionado ? "#EDEDE4" : COR[p.prioridade],
                fillColor: COR[p.prioridade],
                fillOpacity: 0.85,
                weight: selecionado ? 2 : 1,
              }}
              eventHandlers={{
                click: () => onSelecionar(p),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}