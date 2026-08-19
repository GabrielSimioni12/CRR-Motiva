"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { useAlertas } from "@/lib/useAlertas";

type Filtro = "pendente" | "todos";

/**
 * Conteúdo de alertas reaproveitado em dois lugares: a página /alertas
 * (compacto=false, sempre acessível de verdade — dropdown é mais difícil
 * de navegar por teclado/leitor de tela) e o dropdown do sino no header
 * (compacto=true, dentro de um popover). Mesma lógica, mesmos campos —
 * nada foi cortado na migração pra sino.
 */
export default function PainelAlertas({
  compacto = false,
  aoNavegarParaTrecho,
}: {
  compacto?: boolean;
  aoNavegarParaTrecho?: () => void;
}) {
  const { alertas, carregado, marcarVisto, marcarTodosVistos } = useAlertas();
  const [filtro, setFiltro] = useState<Filtro>("pendente");

  const visiveis = [...alertas]
    .filter((a) => (filtro === "todos" ? true : a.status === "pendente"))
    .sort((a, b) => b.dataHoraISO.localeCompare(a.dataHoraISO));

  const pendentes = alertas.filter((a) => a.status === "pendente").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!compacto && (
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
            Alertas de trechos críticos
          </h1>
        )}
        {pendentes > 0 && (
          <button
            onClick={marcarTodosVistos}
            className="border border-asphalt-600 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-chalk hover:border-chalkdim"
          >
            marcar todos como vistos
          </button>
        )}
      </div>

      {!compacto && (
        <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
          Disparados automaticamente quando um trecho cruza o mesmo limiar de
          nível crítico usado na priorização (nível ≥ 3). Ficam salvos neste
          navegador — dá pra rever ou marcar como visto a qualquer momento.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setFiltro("pendente")}
          className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
            filtro === "pendente"
              ? "border-caution text-caution"
              : "border-asphalt-700 text-chalkdim hover:border-chalkdim"
          }`}
        >
          pendentes ({pendentes})
        </button>
        <button
          onClick={() => setFiltro("todos")}
          className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
            filtro === "todos"
              ? "border-caution text-caution"
              : "border-asphalt-700 text-chalkdim hover:border-chalkdim"
          }`}
        >
          todos ({alertas.length})
        </button>
      </div>

      <div className={compacto ? "mt-4 max-h-80 overflow-y-auto" : "mt-6"}>
        {!carregado ? (
          <p className="font-mono text-sm text-chalkdim">carregando alertas...</p>
        ) : visiveis.length === 0 ? (
          <div className="border border-dashed border-asphalt-700 p-6 text-center font-sans text-sm text-chalkdim">
            {filtro === "pendente"
              ? "Nenhum alerta pendente no momento."
              : "Nenhum alerta registrado ainda."}
          </div>
        ) : (
          <div className="space-y-3">
            {visiveis.map((a, i) => (
              <Reveal key={a.id} delay={compacto ? 0 : Math.min(i * 0.04, 0.3)}>
                <div className="flex flex-wrap items-center justify-between gap-3 border border-asphalt-700 bg-asphalt-800 p-3">
                  <Link
                    href={`/?tab=mapa-tendencia&trecho=${encodeURIComponent(a.id)}`}
                    onClick={aoNavegarParaTrecho}
                    className="min-w-0 flex-1 hover:opacity-80"
                  >
                    <p className="truncate font-sans text-sm text-chalk">
                      {a.descricao} — km {a.km.toFixed(1)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-chalkdim">
                      {new Date(a.dataHoraISO).toLocaleString("pt-BR")} — nível{" "}
                      {a.nivelAtingido}
                    </p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
                        a.status === "pendente"
                          ? "border-route-alta/40 bg-route-alta/15 text-route-alta"
                          : "border-asphalt-600 bg-asphalt-600/40 text-chalkdim"
                      }`}
                    >
                      {a.status}
                    </span>
                    {a.status === "pendente" && (
                      <button
                        onClick={() => marcarVisto(a.id)}
                        className="border border-asphalt-600 px-2 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-chalk hover:border-chalkdim"
                      >
                        marcar visto
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {compacto && (
        <Link
          href="/alertas"
          onClick={aoNavegarParaTrecho}
          className="mt-3 inline-block font-mono text-xs uppercase tracking-wide text-caution hover:underline"
        >
          ver todos em uma página →
        </Link>
      )}
    </div>
  );
}
