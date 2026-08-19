"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MapaTendenciaPanel from "./MapaTendenciaPainel";
import SimulacaoPanel from "./SimulacaoPanel";
import { trechosPrioridade } from "@/lib/data";

type Aba = "mapa" | "simulacao";

const PESO_PRIORIDADE: Record<string, number> = { alta: 0, media: 1, baixa: 2, sem_dado: 3 };

function trechoMaisUrgenteChave(): string {
  const ordenado = [...trechosPrioridade].sort((a, b) => {
    const p = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
    if (p !== 0) return p;
    const da = a.dias_estimados_ate_critico ?? Infinity;
    const db = b.dias_estimados_ate_critico ?? Infinity;
    return da - db;
  });
  const t = ordenado[0];
  return t ? `${t.item_id}-${t.km}` : "";
}

export default function PainelDados() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const aba: Aba = searchParams.get("tab") === "simulacao" ? "simulacao" : "mapa";
  const trechoId = searchParams.get("trecho") || trechoMaisUrgenteChave();

  const atualizarParams = useCallback(
    (novo: { tab?: Aba; trecho?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (novo.tab) params.set("tab", novo.tab === "simulacao" ? "simulacao" : "mapa-tendencia");
      if (novo.trecho) params.set("trecho", novo.trecho);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div id="painel-dados" className="scroll-mt-24">
      <div className="flex gap-2">
        <button
          onClick={() => atualizarParams({ tab: "mapa" })}
          className={`border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide ${
            aba === "mapa"
              ? "border-caution text-caution"
              : "border-asphalt-700 text-chalkdim hover:border-chalkdim"
          }`}
        >
          Tendência
        </button>
        <button
          onClick={() => atualizarParams({ tab: "simulacao" })}
          className={`border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide ${
            aba === "simulacao"
              ? "border-caution text-caution"
              : "border-asphalt-700 text-chalkdim hover:border-chalkdim"
          }`}
        >
          Simulação sazonal
        </button>
      </div>

      <div className="mt-6">
        {aba === "mapa" ? (
          <MapaTendenciaPanel
            trechoSelecionadoId={trechoId}
            onSelecionarTrecho={(id) => atualizarParams({ tab: "mapa", trecho: id })}
          />
        ) : (
          <SimulacaoPanel />
        )}
      </div>
    </div>
  );
}