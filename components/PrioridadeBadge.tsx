import { Prioridade } from "@/lib/data";
import { LABEL_PRIORIDADE } from "@/lib/labels";

const CLASSE: Record<Prioridade, string> = {
  alta: "bg-route-alta/15 text-route-alta border-route-alta/40",
  media: "bg-route-media/15 text-route-media border-route-media/40",
  baixa: "bg-route-ok/15 text-route-ok border-route-ok/40",
  sem_dado: "bg-asphalt-600/40 text-chalkdim border-asphalt-600",
};

export default function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${CLASSE[prioridade]}`}
    >
      {LABEL_PRIORIDADE[prioridade]}
    </span>
  );
}
