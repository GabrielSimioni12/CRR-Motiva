import { AgendamentoCorte } from "@/lib/agenda";
import {
  NOMES_DIAS_SEMANA,
  adicionarDias,
  formatarDataISO,
  inicioDaSemana,
  inicioDoMes,
  mesmoMes,
} from "@/lib/calendario";

const COR_PRIORIDADE: Record<string, string> = {
  alta: "border-route-alta/50 bg-route-alta/15 text-route-alta",
  media: "border-route-media/50 bg-route-media/15 text-route-media",
  baixa: "border-route-ok/50 bg-route-ok/15 text-route-ok",
  sem_dado: "border-asphalt-600 bg-asphalt-600/30 text-chalkdim",
};

function ChipAgendamento({
  agendamento,
  onRemover,
}: {
  agendamento: AgendamentoCorte;
  onRemover: (id: string) => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between gap-1 border px-1.5 py-1 font-mono text-[10px] leading-tight ${COR_PRIORIDADE[agendamento.prioridade]}`}
      title={`${agendamento.trechoDescricao} — km ${agendamento.km.toFixed(1)} — ${agendamento.equipe}`}
    >
      <span className="truncate">
        {agendamento.trechoDescricao} · {agendamento.equipe.replace("Equipe ", "")}
      </span>
      <button
        onClick={() => onRemover(agendamento.id)}
        className="shrink-0 opacity-60 hover:opacity-100"
        aria-label="Remover agendamento"
      >
        ×
      </button>
    </div>
  );
}

export default function AgendaCalendario({
  modo,
  referencia,
  agendamentos,
  onSelecionarDia,
  onRemover,
}: {
  modo: "mes" | "semana";
  referencia: Date;
  agendamentos: AgendamentoCorte[];
  onSelecionarDia: (iso: string) => void;
  onRemover: (id: string) => void;
}) {
  const porDia = new Map<string, AgendamentoCorte[]>();
  agendamentos.forEach((a) => {
    const lista = porDia.get(a.data) ?? [];
    lista.push(a);
    porDia.set(a.data, lista);
  });

  if (modo === "semana") {
    const inicio = inicioDaSemana(referencia);
    const dias = Array.from({ length: 7 }, (_, i) => adicionarDias(inicio, i));

    return (
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {dias.map((dia) => {
            const iso = formatarDataISO(dia);
            const itens = porDia.get(iso) ?? [];
            return (
              <div
                key={iso}
                className="flex min-h-[140px] flex-col gap-1 border border-asphalt-700 bg-asphalt-800 p-2"
              >
                <button
                  onClick={() => onSelecionarDia(iso)}
                  className="text-left font-mono text-[10px] uppercase tracking-wide text-chalkdim hover:text-caution"
                >
                  {NOMES_DIAS_SEMANA[dia.getDay()]} {dia.getDate()}
                </button>
                <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
                  {itens.map((a) => (
                    <ChipAgendamento key={a.id} agendamento={a} onRemover={onRemover} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const inicioGrade = inicioDaSemana(inicioDoMes(referencia));
  const dias = Array.from({ length: 42 }, (_, i) => adicionarDias(inicioGrade, i));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[640px] grid-cols-7 gap-1">
        {NOMES_DIAS_SEMANA.map((n) => (
          <div key={n} className="px-1 py-1 font-mono text-[10px] uppercase tracking-widest text-chalkdim">
            {n}
          </div>
        ))}
        {dias.map((dia) => {
          const iso = formatarDataISO(dia);
          const itens = porDia.get(iso) ?? [];
          const foraDoMes = !mesmoMes(dia, referencia);
          return (
            <div
              key={iso}
              className={`flex min-h-[84px] flex-col gap-1 border border-asphalt-700 p-1.5 ${
                foraDoMes ? "bg-asphalt-900/50 opacity-50" : "bg-asphalt-800"
              }`}
            >
              <button
                onClick={() => onSelecionarDia(iso)}
                className="text-left font-mono text-[10px] text-chalkdim hover:text-caution"
              >
                {dia.getDate()}
              </button>
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                {itens.slice(0, 2).map((a) => (
                  <ChipAgendamento key={a.id} agendamento={a} onRemover={onRemover} />
                ))}
                {itens.length > 2 && (
                  <span className="font-mono text-[9px] text-chalkdim">+{itens.length - 2} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
