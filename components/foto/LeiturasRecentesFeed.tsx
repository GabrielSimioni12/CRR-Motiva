"use client";

import { useEffect, useState } from "react";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import { Prioridade } from "@/lib/data";

interface LeituraBanco {
  id: number;
  local: string;
  km: string | null;
  altura_cm: string;
  nivel: number;
  fonte: "foto" | "manual";
  confianca: string | null;
  justificativa: string | null;
  criado_em: string;
}

const PRIORIDADE_POR_NIVEL: Record<number, Prioridade> = {
  1: "baixa",
  2: "media",
  3: "alta",
};

export default function LeiturasRecentesFeed() {
  const [leituras, setLeituras] = useState<LeituraBanco[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await fetch("/api/leituras");
      const data = await resp.json();
      if (!resp.ok) {
        setErro(data.error ?? "Erro ao buscar leituras");
      } else {
        setLeituras(data);
      }
    } catch (e) {
      console.error("Falha ao buscar leituras:", e);
      setErro("Falha de conexão ao buscar as leituras da equipe.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <section className="mt-14 border-t border-asphalt-700 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
            Leituras recentes da equipe
          </h2>
          <p className="mt-1 max-w-2xl font-sans text-sm text-chalkdim">
            Todas as classificações registradas por qualquer pessoa, salvas
            no banco de dados — não são só desta sessão do navegador. Essas
            leituras não fazem parte ainda do cálculo oficial de prioridade
            da rodovia (que continua baseado nos dados reais da Motiva); é
            um log de validação e acompanhamento em paralelo.
          </p>
        </div>
        <button
          onClick={carregar}
          disabled={carregando}
          className="shrink-0 border border-asphalt-600 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-chalk hover:border-chalkdim disabled:opacity-50"
        >
          {carregando ? "atualizando..." : "atualizar"}
        </button>
      </div>

      <div className="mt-6">
        {erro && (
          <div className="border border-route-alta/40 bg-route-alta/10 p-4 font-sans text-sm text-route-alta">
            {erro}
          </div>
        )}

        {!erro && leituras === null && (
          <p className="font-mono text-sm text-chalkdim">carregando leituras...</p>
        )}

        {!erro && leituras !== null && leituras.length === 0 && (
          <div className="border border-dashed border-asphalt-700 p-8 text-center font-sans text-sm text-chalkdim">
            Nenhuma leitura registrada ainda pela equipe.
          </div>
        )}

        {!erro && leituras !== null && leituras.length > 0 && (
          <div className="space-y-3">
            {leituras.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-asphalt-700 bg-asphalt-800 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm text-chalk">{l.local}</p>
                  <p className="mt-1 font-mono text-xs text-chalkdim">
                    {new Date(l.criado_em).toLocaleString("pt-BR")} —{" "}
                    {Number(l.altura_cm).toFixed(0)} cm
                    {l.km !== null && ` — km ${Number(l.km).toFixed(1)}`}
                    {" — "}
                    <span className="uppercase">{l.fonte}</span>
                    {l.confianca && ` (confiança ${l.confianca})`}
                  </p>
                  {l.justificativa && (
                    <p className="mt-1 max-w-xl font-sans text-xs text-chalkdim">
                      {l.justificativa}
                    </p>
                  )}
                </div>
                <PrioridadeBadge prioridade={PRIORIDADE_POR_NIVEL[l.nivel]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}