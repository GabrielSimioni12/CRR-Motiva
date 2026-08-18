"use client";

import { useMemo } from "react";
import MapaComPainel from "@/components/MapPaniel";
import GraficoTendencia from "@/components/GraficoTendencia";
import GraficoBarras from "./GraficoBarras";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import { mapaPontos, trechosPrioridade } from "@/lib/data";
import { descreverTendencia } from "@/lib/tendencia";
import { porTipoRocada, criticosPorZona } from "@/lib/graficosDashboard";

const PESO_PRIORIDADE: Record<string, number> = { alta: 0, media: 1, baixa: 2, sem_dado: 3 };

export default function MapaTendenciaPanel({
  trechoSelecionadoId,
  onSelecionarTrecho,
}: {
  trechoSelecionadoId: string;
  onSelecionarTrecho: (id: string) => void;
}) {
  const trechosOrdenados = useMemo(
    () =>
      [...trechosPrioridade]
        .map((t) => ({ ...t, chave: `${t.item_id}-${t.km}` }))
        .sort((a, b) => {
          const p = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
          if (p !== 0) return p;
          const da = a.dias_estimados_ate_critico ?? Infinity;
          const db = b.dias_estimados_ate_critico ?? Infinity;
          return da - db;
        }),
    []
  );

  const trecho =
    trechosOrdenados.find((t) => t.chave === trechoSelecionadoId) ?? trechosOrdenados[0];

  const graficoTipoRocada = useMemo(() => porTipoRocada(mapaPontos), []);
  const graficoZonaCritica = useMemo(() => criticosPorZona(trechosPrioridade), []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
          Mapa da rodovia — SP-021
        </h2>
        <p className="mt-1 max-w-2xl font-sans text-sm text-chalkdim">
          {mapaPontos.length} pontos classificados a partir dos dados de campo
          (13/03–20/03). Selecionar um trecho abaixo realça o grupo de pontos
          correspondente no mapa (destacado em amarelo) — mapa e tabela de
          trechos usam bases de dados diferentes e sem uma chave exata entre
          si, então o realce é por proximidade de km, não um ponto único.
        </p>
      </div>

      <MapaComPainel pontos={mapaPontos} kmRealcado={trecho?.km ?? null} />

      <div className="border-t border-asphalt-700 pt-8">
        <div className="flex flex-col gap-2 sm:max-w-md">
          <label
            htmlFor="trecho-select-dashboard"
            className="font-mono text-[11px] uppercase tracking-widest text-chalkdim"
          >
            Ver tendência do trecho
          </label>
          <select
            id="trecho-select-dashboard"
            value={trecho?.chave ?? ""}
            onChange={(e) => onSelecionarTrecho(e.target.value)}
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
          <div className="mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-chalk">
                  {trecho.descricao} — km {trecho.km.toFixed(1)}
                </p>
                <p className="mt-1 font-sans text-sm text-chalkdim">{descreverTendencia(trecho)}</p>
              </div>
              <PrioridadeBadge prioridade={trecho.prioridade} />
            </div>

            <GraficoTendencia trecho={trecho} />

            <p className="mt-3 font-mono text-xs text-chalkdim">
              linha sólida = leituras reais · linha tracejada = projeção de
              tendência (não é dado medido)
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-asphalt-700 pt-8">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-chalkdim">
          Distribuição adicional
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <GraficoBarras titulo="pontos por tipo de equipamento de roçada" dados={graficoTipoRocada} cor="#D98A1F" />
          <GraficoBarras titulo="trechos críticos por zona de corte" dados={graficoZonaCritica} cor="#C4432C" />
        </div>
      </div>
    </div>
  );
}
