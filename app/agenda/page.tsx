"use client";

import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import AgendaCalendario from "@/components/AgendaCalendario";
import { trechosPrioridade } from "@/lib/data";
import { EQUIPES } from "@/lib/agenda";
import { useAgenda } from "@/lib/useAgenda";
import {
  adicionarDias,
  adicionarMeses,
  formatarDataISO,
  inicioDaSemana,
} from "@/lib/calendario";

const PESO_PRIORIDADE: Record<string, number> = { alta: 0, media: 1, baixa: 2, sem_dado: 3 };

export default function AgendaPage() {
  const { agendamentos, carregado, adicionar, remover } = useAgenda();
  const [modo, setModo] = useState<"mes" | "semana">("mes");
  const [referencia, setReferencia] = useState(new Date());

  const trechosAgendaveis = useMemo(
    () =>
      [...trechosPrioridade]
        .filter((t) => t.prioridade === "alta" || t.prioridade === "media")
        .map((t, i) => ({ ...t, chave: `${t.item_id}-${t.km}-${i}` }))
        .sort((a, b) => PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade]),
    []
  );

  const [trechoChave, setTrechoChave] = useState(trechosAgendaveis[0]?.chave ?? "");
  const [data, setData] = useState(formatarDataISO(new Date()));
  const [equipe, setEquipe] = useState(EQUIPES[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trecho = trechosAgendaveis.find((t) => t.chave === trechoChave);
    if (!trecho || !data) return;

    adicionar({
      trechoDescricao: trecho.descricao,
      km: trecho.km,
      prioridade: trecho.prioridade,
      data,
      equipe,
    });
  }

  function navegar(direcao: -1 | 1) {
    setReferencia((atual) =>
      modo === "mes" ? adicionarMeses(atual, direcao) : adicionarDias(atual, direcao * 7)
    );
  }

  const labelReferencia =
    modo === "mes"
      ? referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      : (() => {
          const inicio = inicioDaSemana(referencia);
          const fim = adicionarDias(inicio, 6);
          return `${inicio.toLocaleDateString("pt-BR")} – ${fim.toLocaleDateString("pt-BR")}`;
        })();

  return (
    <main id="conteudo-principal" className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
        Agenda de cortes e manutenção
      </h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        Agende trechos de prioridade alta ou média pra uma data e equipe. Fica
        salvo neste navegador — ainda não tem confirmação de execução (é o
        próximo passo natural aqui), só o agendamento em si.
      </p>

      {/* FORMULÁRIO */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-wrap items-end gap-4 border border-asphalt-700 bg-asphalt-800 p-5"
      >
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Trecho
          </label>
          <select
            value={trechoChave}
            onChange={(e) => setTrechoChave(e.target.value)}
            className="border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-sans text-sm text-chalk outline-none focus:border-caution"
          >
            {trechosAgendaveis.map((t) => (
              <option key={t.chave} value={t.chave}>
                {t.descricao} — km {t.km.toFixed(1)} ({t.prioridade})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-mono text-sm text-chalk outline-none focus:border-caution"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Equipe
          </label>
          <select
            value={equipe}
            onChange={(e) => setEquipe(e.target.value)}
            className="border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-sans text-sm text-chalk outline-none focus:border-caution"
          >
            {EQUIPES.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!trechoChave}
          className="border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90 disabled:opacity-50"
        >
          agendar corte
        </button>
      </form>

      {/* CALENDÁRIO */}
      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navegar(-1)}
              className="border border-asphalt-600 px-3 py-1.5 font-mono text-sm text-chalk hover:border-chalkdim"
              aria-label="Anterior"
            >
              ←
            </button>
            <p className="min-w-[180px] font-display text-lg font-semibold uppercase tracking-wide text-chalk">
              {labelReferencia}
            </p>
            <button
              onClick={() => navegar(1)}
              className="border border-asphalt-600 px-3 py-1.5 font-mono text-sm text-chalk hover:border-chalkdim"
              aria-label="Próximo"
            >
              →
            </button>
            <button
              onClick={() => setReferencia(new Date())}
              className="border border-asphalt-700 px-3 py-1.5 font-mono text-xs uppercase text-chalkdim hover:border-chalkdim"
            >
              hoje
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModo("mes")}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                modo === "mes"
                  ? "border-caution text-caution"
                  : "border-asphalt-700 text-chalkdim hover:border-chalkdim"
              }`}
            >
              mês
            </button>
            <button
              onClick={() => setModo("semana")}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
                modo === "semana"
                  ? "border-caution text-caution"
                  : "border-asphalt-700 text-chalkdim hover:border-chalkdim"
              }`}
            >
              semana
            </button>
          </div>
        </div>

        <div className="mt-4">
          {!carregado ? (
            <p className="font-mono text-sm text-chalkdim">carregando agenda...</p>
          ) : (
            <AgendaCalendario
              modo={modo}
              referencia={referencia}
              agendamentos={agendamentos}
              onSelecionarDia={setData}
              onRemover={remover}
            />
          )}
        </div>
      </Reveal>
    </main>
  );
}
