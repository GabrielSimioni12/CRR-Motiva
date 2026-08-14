"use client";

import "leaflet/dist/leaflet.css";
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
  );
}