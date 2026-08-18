import { MapaPonto, Prioridade } from "@/lib/data";

const COR: Record<Prioridade, string> = {
  alta: "#C4432C",
  media: "#D98A1F",
  baixa: "#3F8F5F",
  sem_dado: "#6B7076",
};

const KM_TOTAL = 29.3;

/**
 * Representação estática e esquemática da rodovia (não é o mapa
 * geográfico real) — usada no relatório em PDF porque o mapa Leaflet real
 * usa tiles do OpenStreetMap em outro domínio, o que "contamina" o canvas
 * do html2canvas e impede exportar a imagem. Aqui é só uma régua de 0 a
 * 29,3 km com um ponto por trecho, na mesma paleta de prioridade do resto
 * da plataforma — dá pra ver a distribuição espacial sem depender de tile
 * externo.
 */
export default function MapaEsquematico({ pontos }: { pontos: MapaPonto[] }) {
  return (
    <div className="border border-asphalt-700 bg-asphalt-800 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-chalkdim">
        mapa esquemático — SP-021 (0 a {KM_TOTAL} km)
      </p>
      <svg viewBox="0 0 600 60" className="mt-3 w-full" preserveAspectRatio="none">
        <line x1="10" y1="30" x2="590" y2="30" stroke="#43484E" strokeWidth="2" />
        {pontos.map((p, i) => {
          const x = 10 + (Math.min(p.km_estimado, KM_TOTAL) / KM_TOTAL) * 580;
          return (
            <circle key={i} cx={x} cy={30} r={3} fill={COR[p.prioridade]} fillOpacity={0.85} />
          );
        })}
        <text x="10" y="52" className="fill-chalkdim" style={{ font: "9px var(--font-mono)" }}>
          km 0
        </text>
        <text x="590" y="52" textAnchor="end" className="fill-chalkdim" style={{ font: "9px var(--font-mono)" }}>
          km {KM_TOTAL}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase text-chalkdim">
        {(Object.keys(COR) as Prioridade[]).map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COR[p] }} />
            {p.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
