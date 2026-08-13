import { Prioridade } from "@/lib/data";

const CONFIG: Record<Prioridade, { label: string; className: string }> = {
  alta: { label: "cortar agora", className: "bg-route-alta/15 text-route-alta border-route-alta/40" },
  media: { label: "agendado", className: "bg-route-media/15 text-route-media border-route-media/40" },
  baixa: { label: "ok", className: "bg-route-ok/15 text-route-ok border-route-ok/40" },
  sem_dado: { label: "sem dado", className: "bg-asphalt-600/40 text-chalkdim border-asphalt-600" },
};

export default function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const c = CONFIG[prioridade];
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${c.className}`}
    >
      {c.label}
    </span>
  );
}
