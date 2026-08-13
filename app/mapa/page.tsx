import dynamic from "next/dynamic";
import { mapaPontos, getResumo } from "@/lib/data";

const MapaRodovia = dynamic(() => import("@/components/MapaRodovia"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-sm text-chalkdim">
      carregando mapa...
    </div>
  ),
});

export default function MapaPage() {
  const resumo = getResumo();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
            Mapa da rodovia — SP-021
          </h1>
          <p className="mt-1 font-sans text-sm text-chalkdim">
            {mapaPontos.length} pontos classificados a partir dos dados reais
            de campo (13/03–20/03).
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs uppercase tracking-wide">
          <span className="flex items-center gap-1.5 text-route-alta">
            <span className="h-2.5 w-2.5 rounded-full bg-route-alta" /> cortar
            ({resumo.alta})
          </span>
          <span className="flex items-center gap-1.5 text-route-media">
            <span className="h-2.5 w-2.5 rounded-full bg-route-media" /> agendado
            ({resumo.media})
          </span>
          <span className="flex items-center gap-1.5 text-route-ok">
            <span className="h-2.5 w-2.5 rounded-full bg-route-ok" /> ok
            ({resumo.baixa})
          </span>
        </div>
      </div>

      <div className="h-[600px] w-full border border-asphalt-700">
        <MapaRodovia pontos={mapaPontos} />
      </div>

      <p className="font-sans text-xs text-chalkdim">
        Coordenadas extraídas dos polígonos reais de classificação de roçada
        fornecidos pela Motiva (KML), com o km estimado por proximidade aos
        marcos oficiais de quilometragem da rodovia.
      </p>
    </main>
  );
}
