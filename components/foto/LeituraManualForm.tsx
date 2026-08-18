"use client";

import { useState } from "react";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import { classificarAltura, ResultadoClassificacao } from "@/lib/classificacao";

interface LeituraManual {
  id: number;
  local: string;
  alturaCm: number;
  resultado: ResultadoClassificacao;
  horario: string;
}

export default function LeituraManualForm() {
  const [local, setLocal] = useState("");
  const [altura, setAltura] = useState("");
  const [leituras, setLeituras] = useState<LeituraManual[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const alturaNum = parseFloat(altura.replace(",", "."));
    if (isNaN(alturaNum) || alturaNum < 0) return;

    const resultado = classificarAltura(alturaNum);
    const nova: LeituraManual = {
      id: Date.now(),
      local: local.trim() || "Ponto sem nome",
      alturaCm: alturaNum,
      resultado,
      horario: new Date().toLocaleTimeString("pt-BR"),
    };
    setLeituras((prev) => [nova, ...prev]);
    setLocal("");
    setAltura("");
  }

  return (
    <section className="mt-14 border-t border-asphalt-700 pt-10">
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
        Nova leitura manual
      </h2>
      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        Prefere medir com trena em vez de foto? Digite a altura direto
        aqui — a plataforma classifica na hora, com a mesma regra usada
        acima e nos dados reais da SP-021.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap items-end gap-4 border border-asphalt-700 bg-asphalt-800 p-5">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Local / trecho
          </label>
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="ex: praça perto de casa, ponto 1"
            className="w-56 border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-sans text-sm text-chalk outline-none focus:border-caution"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Altura medida (cm)
          </label>
          <input
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            placeholder="ex: 24"
            inputMode="decimal"
            required
            className="w-32 border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-mono text-sm text-chalk outline-none focus:border-caution"
          />
        </div>
        <button
          type="submit"
          className="border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90"
        >
          Classificar
        </button>
      </form>

      {leituras.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-chalkdim">
          Nenhuma leitura manual registrada ainda nesta sessão.
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Leituras desta sessão
          </p>
          {leituras.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 border border-asphalt-700 bg-asphalt-800 p-4">
              <div>
                <p className="font-sans text-sm text-chalk">{l.local}</p>
                <p className="font-mono text-xs text-chalkdim">
                  {l.horario} — {l.alturaCm} cm ({l.resultado.descricaoNivel})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-sans text-xs text-chalkdim">{l.resultado.recomendacao}</span>
                <PrioridadeBadge prioridade={l.resultado.prioridade} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 font-sans text-xs text-chalkdim">
        Essas leituras ficam só nesta sessão do navegador (não são salvas
        em nenhum banco ainda) — próximo passo é persistir isso e juntar
        com os dados reais da SP-021 no mesmo painel.
      </p>
    </section>
  );
}
