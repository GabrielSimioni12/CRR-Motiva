"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SimulacaoBadge from "@/components/SimulacaoBadge";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import Reveal from "@/components/Reveal";
import { trechosPrioridade } from "@/lib/data";
import {
  CENARIOS,
  Cenario,
  calcularMultiplicador,
  projetarTrechos,
} from "@/lib/simulacao";
import { ResumoClimatico } from "@/lib/clima";

type EstadoClima =
  | { status: "carregando" }
  | { status: "ok"; dados: ResumoClimatico }
  | { status: "erro"; mensagem: string };

export default function SimulacaoPage() {
  const [cenario, setCenario] = useState<Cenario>("chuvosa");
  const [clima, setClima] = useState<EstadoClima>({ status: "carregando" });

  useEffect(() => {
    let cancelado = false;
    fetch("/api/clima")
      .then(async (resp) => {
        const data = await resp.json();
        if (cancelado) return;
        if (!resp.ok) {
          setClima({ status: "erro", mensagem: data.error ?? "Erro ao buscar clima" });
        } else {
          setClima({ status: "ok", dados: data });
        }
      })
      .catch((err) => {
        console.error("Falha ao buscar clima histórico:", err);
        if (!cancelado) {
          setClima({ status: "erro", mensagem: "Falha de conexão ao buscar o clima." });
        }
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const climaDados = clima.status === "ok" ? clima.dados : null;
  const { multiplicador, ajusteClimaAplicado } = calcularMultiplicador(cenario, climaDados);
  const projecoes = projetarTrechos(trechosPrioridade, cenario, climaDados);

  return (
    <main id="conteudo-principal" className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
          Simulação de crescimento sazonal
        </h1>
        <SimulacaoBadge />
      </div>

      <p className="mt-3 max-w-3xl font-sans text-sm leading-relaxed text-chalkdim">
        Projeta em quantas semanas cada trecho de prioridade alta ou média
        atingiria o nível crítico, aplicando um multiplicador sazonal sobre a
        taxa de crescimento real medida em campo (13/03–20/03). Os
        coeficientes de época são arbitrários (documentados em{" "}
        <code className="font-mono text-xs text-chalk">lib/simulacao.ts</code>
        ) e ajustados pela chuva histórica da região via Open-Meteo, quando
        disponível.
      </p>

      {/* PAINEL DE CLIMA */}
      <Reveal className="mt-8">
        <div className="border border-asphalt-700 bg-asphalt-800 p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Clima histórico da região (Open-Meteo)
          </p>

          {clima.status === "carregando" && (
            <p className="mt-3 font-mono text-sm text-chalkdim">
              buscando dados de precipitação...
            </p>
          )}

          {clima.status === "erro" && (
            <div className="mt-3">
              <p className="font-sans text-sm text-route-media">
                Não foi possível buscar o clima histórico agora. A simulação
                segue com os coeficientes-base fixos (1.6x chuvosa / 0.6x
                seca), sem o ajuste fino por chuva real.
              </p>
              <p className="mt-1 font-mono text-xs text-chalkdim">{clima.mensagem}</p>
            </div>
          )}

          {clima.status === "ok" && (
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase text-chalkdim">
                  chuva média/dia — chuvosa
                </p>
                <p className="font-display text-xl font-semibold text-chalk">
                  {clima.dados.precipMediaDiariaChuvosa.toFixed(1)} mm
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-chalkdim">
                  chuva média/dia — seca
                </p>
                <p className="font-display text-xl font-semibold text-chalk">
                  {clima.dados.precipMediaDiariaSeca.toFixed(1)} mm
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-chalkdim">
                  ano de referência
                </p>
                <p className="font-display text-xl font-semibold text-chalk">
                  {clima.dados.anoReferencia}
                </p>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* SELETOR DE CENÁRIO */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
          cenário:
        </span>
        {CENARIOS.map((c) => (
          <button
            key={c.valor}
            onClick={() => setCenario(c.valor)}
            className={`border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
              cenario === c.valor
                ? "border-caution bg-caution text-asphalt-900"
                : "border-asphalt-600 text-chalk hover:border-chalkdim"
            }`}
          >
            {c.label} <span className="opacity-70">({c.periodo})</span>
          </button>
        ))}

        <span className="ml-2 font-mono text-xs text-chalkdim">
          multiplicador aplicado: {multiplicador.toFixed(2)}x
          {ajusteClimaAplicado ? " (ajustado pelo clima real)" : " (coeficiente-base)"}
        </span>
      </div>

      {/* TABELA DE PROJEÇÃO */}
      <div className="mt-6">
        {projecoes.length === 0 ? (
          <div className="border border-dashed border-asphalt-700 p-8 text-center font-sans text-sm text-chalkdim">
            Nenhum trecho de prioridade alta ou média para projetar no
            momento.
          </div>
        ) : (
          <motion.div layout className="overflow-x-auto border border-asphalt-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-asphalt-700 bg-asphalt-800 font-mono text-[11px] uppercase tracking-widest text-chalkdim">
                  <th className="px-4 py-3">Trecho</th>
                  <th className="px-4 py-3">Km</th>
                  <th className="px-4 py-3">Nível atual</th>
                  <th className="px-4 py-3">Taxa real (nível/dia)</th>
                  <th className="px-4 py-3">Taxa ajustada</th>
                  <th className="px-4 py-3">Semanas até crítico</th>
                  <th className="px-4 py-3">Prioridade</th>
                </tr>
              </thead>
              <tbody className="font-sans">
                {projecoes.map((p, i) => (
                  <motion.tr
                    layout
                    key={`${p.trecho.item_id}-${p.trecho.km}-${i}`}
                    className="border-b border-asphalt-700/60 last:border-0 hover:bg-asphalt-800/60"
                  >
                    <td className="px-4 py-3 text-chalk">{p.trecho.descricao}</td>
                    <td className="px-4 py-3 font-mono text-chalkdim">{p.trecho.km.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-chalkdim">{p.trecho.nivel_semana2}</td>
                    <td className="px-4 py-3 font-mono text-chalkdim">
                      {p.trecho.taxa_diaria.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 font-mono text-chalk">{p.taxaAjustada.toFixed(3)}</td>
                    <td className="px-4 py-3 font-mono text-chalk">
                      {p.semanasAteCritico === null
                        ? "não atinge"
                        : p.semanasAteCritico === 0
                          ? "já crítico"
                          : `${p.semanasAteCritico} semana${p.semanasAteCritico > 1 ? "s" : ""}`}
                    </td>
                    <td className="px-4 py-3">
                      <PrioridadeBadge prioridade={p.trecho.prioridade} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </main>
  );
}
