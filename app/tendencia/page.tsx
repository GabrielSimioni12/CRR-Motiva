"use client";

import { useMemo, useState } from "react";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import GraficoTendencia from "@/components/GraficoTendencia";
import Reveal from "@/components/Reveal";
import { trechosPrioridade } from "@/lib/data";
import { descreverTendencia } from "@/lib/tendencia";

const PESO_PRIORIDADE: Record<string, number> = { alta: 0, media: 1, baixa: 2, sem_dado: 3 };

export default function TendenciaPage() {
  const trechosOrdenados = useMemo(
    () =>
      [...trechosPrioridade]
        .map((t, i) => ({ ...t, chave: `${t.item_id}-${t.km}-${i}` }))
        .sort((a, b) => {
          const p = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
          if (p !== 0) return p;
          const da = a.dias_estimados_ate_critico ?? Infinity;
          const db = b.dias_estimados_ate_critico ?? Infinity;
          return da - db;
        }),
    []
  );

  const [chaveSelecionada, setChaveSelecionada] = useState(trechosOrdenados[0]?.chave ?? "");
  const trecho = trechosOrdenados.find((t) => t.chave === chaveSelecionada);

  return (
    <main id="conteudo-principal" className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
        Tendência de crescimento por trecho
      </h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        As duas leituras reais de campo (13/03 e 20/03) e a projeção de
        tendência — mesma taxa de crescimento diária já usada na
        priorização — até o trecho atingir o nível crítico.
      </p>

      {trechosOrdenados.length === 0 ? (
        <div className="mt-8 border border-dashed border-asphalt-700 p-8 text-center font-sans text-sm text-chalkdim">
          Nenhum trecho monitorado no momento.
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-2 sm:max-w-md">
            <label
              htmlFor="trecho-select"
              className="font-mono text-[11px] uppercase tracking-widest text-chalkdim"
            >
              Selecionar trecho
            </label>
            <select
              id="trecho-select"
              value={chaveSelecionada}
              onChange={(e) => setChaveSelecionada(e.target.value)}
              className="border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-sans text-sm text-chalk outline-none focus:border-caution"
            >
              {trechosOrdenados.map((t) => (
                <option key={t.chave} value={t.chave}>
                  {t.descricao} — km {t.km.toFixed(1)} ({t.prioridade})
                </option>
              ))}
            </select>
          </div>

          {trecho && (
            <Reveal className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-chalk">
                    {trecho.descricao} — km {trecho.km.toFixed(1)}
                  </p>
                  <p className="mt-1 font-sans text-sm text-chalkdim">
                    {descreverTendencia(trecho)}
                  </p>
                </div>
                <PrioridadeBadge prioridade={trecho.prioridade} />
              </div>

              <GraficoTendencia trecho={trecho} />

              <p className="mt-3 font-mono text-xs text-chalkdim">
                linha sólida = leituras reais · linha tracejada = projeção de
                tendência (não é dado medido)
              </p>
            </Reveal>
          )}
        </>
      )}
    </main>
  );
}
