"use client";

import { useState } from "react";
import { classificarAltura, ResultadoClassificacao } from "@/lib/classificacao";
import PrioridadeBadge from "@/components/PrioridadeBadge";

interface Leitura {
  id: number;
  local: string;
  alturaCm: number;
  resultado: ResultadoClassificacao;
  horario: string;
}

export default function NovaLeituraPage() {
  const [local, setLocal] = useState("");
  const [altura, setAltura] = useState("");
  const [leituras, setLeituras] = useState<Leitura[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const alturaNum = parseFloat(altura.replace(",", "."));
    if (isNaN(alturaNum) || alturaNum < 0) return;

    const resultado = classificarAltura(alturaNum);
    const nova: Leitura = {
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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
        Nova leitura manual
      </h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        Digite a altura da vegetação medida em campo (trena ou sensor) e a
        plataforma classifica na hora, usando a mesma regra aplicada aos
        dados reais da SP-021. Esse é o mesmo fluxo entrada → processamento
        → saída — hoje a entrada é manual, no futuro pode vir de um sensor
        ou de foto (veja a aba{" "}
        <a href="/foto" className="text-caution underline">
          Classificar por foto
        </a>
        ).
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-wrap items-end gap-4 border border-asphalt-700 bg-asphalt-800 p-5"
      >
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
        <p className="mt-10 font-mono text-sm text-chalkdim">
          Nenhuma leitura registrada ainda nesta sessão.
        </p>
      ) : (
        <div className="mt-10 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Leituras desta sessão
          </p>
          {leituras.map((l) => (
            <div
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-asphalt-700 bg-asphalt-800 p-4"
            >
              <div>
                <p className="font-sans text-sm text-chalk">{l.local}</p>
                <p className="font-mono text-xs text-chalkdim">
                  {l.horario} — {l.alturaCm} cm ({l.resultado.descricaoNivel})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-sans text-xs text-chalkdim">
                  {l.resultado.recomendacao}
                </span>
                <PrioridadeBadge prioridade={l.resultado.prioridade} />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 border-t border-asphalt-700 pt-4 font-sans text-xs text-chalkdim">
        Essas leituras ficam só nesta sessão do navegador (não são salvas em
        nenhum banco ainda) — próximo passo é persistir isso e juntar com os
        dados reais da SP-021 no mesmo painel.
      </p>
    </main>
  );
}
