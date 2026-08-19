"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
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
  realcadosId?: Set<number>;
}

// Margem de segurança ao redor dos pontos reais da rota, em graus
// (~0.02 graus equivale a pouco mais de 2km, o suficiente pra dar
// respiro visual sem deixar o mapa "fugir" pra fora do trecho).
const MARGEM = 0.02;

export default function MapaRodovia({ pontos, selecionadoId, onSelecionar, realcadosId }: Props) {
  const [tilesComErro, setTilesComErro] = useState(false);

  const { centro, bounds } = useMemo(() => {
    if (pontos.length === 0) {
      // fallback: centro aproximado da SP-021 caso ainda não haja pontos carregados
      return {
        centro: [-23.49, -46.79] as [number, number],
        bounds: undefined as LatLngBoundsExpression | undefined,
      };
    }

    const lats = pontos.map((p) => p.centroid_lat);
    const lons = pontos.map((p) => p.centroid_lon);
    const norte = Math.max(...lats) + MARGEM;
    const sul = Math.min(...lats) - MARGEM;
    const leste = Math.max(...lons) + MARGEM;
    const oeste = Math.min(...lons) - MARGEM;

    const boundsCalculados: LatLngBoundsExpression = [
      [sul, oeste],
      [norte, leste],
    ];

    const centroCalculado: [number, number] = [
      (norte + sul) / 2,
      (leste + oeste) / 2,
    ];

    return { centro: centroCalculado, bounds: boundsCalculados };
  }, [pontos]);

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
        minZoom={10}
        maxZoom={17}
        scrollWheelZoom
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTilesComErro(true) }}
        />
        {pontos.map((p) => {
          const selecionado = p.id === selecionadoId;
          const realcado = !selecionado && (realcadosId?.has(p.id) ?? false);
          return (
            <CircleMarker
              key={p.id}
              center={[p.centroid_lat, p.centroid_lon]}
              radius={selecionado ? 8 : realcado ? 7 : 5}
              pathOptions={{
                color: selecionado ? "#EDEDE4" : realcado ? "#F2B705" : COR[p.prioridade],
                fillColor: COR[p.prioridade],
                fillOpacity: 0.85,
                weight: selecionado ? 2 : realcado ? 3 : 1,
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