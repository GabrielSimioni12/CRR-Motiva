import { mapaPontos } from "@/lib/data";
import MapaComPainel from "@/components/MapPaniel";

export default function MapaPage() {
  return (
    <main id="conteudo-principal" className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
          Mapa da rodovia — SP-021
        </h1>
        <p className="mt-1 font-sans text-sm text-chalkdim">
          {mapaPontos.length} pontos classificados a partir dos dados reais
          de campo (13/03–20/03). Clique em um ponto para ver detalhes e a
          imagem do local.
        </p>
      </div>

      <MapaComPainel pontos={mapaPontos} />

      <p className="font-sans text-xs text-chalkdim">
        Coordenadas extraídas dos polígonos reais de classificação de roçada
        fornecidos pela Motiva (KML), com o km estimado por proximidade aos
        marcos oficiais de quilometragem da rodovia.
      </p>
    </main>
  );
}