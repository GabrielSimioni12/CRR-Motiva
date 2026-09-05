"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SimulacaoBadge from "@/components/SimulacaoBadge";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import Reveal from "@/components/Reveal";
import IconClimaAnimado from "@/components/simulacao/IconClimaAnimado";
import GaleriaNiveis from "@/components/simulacao/GaleriaNiveis";
import ZonaDiagrama from "@/components/ZonaDiagrama";
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

const LIMITE_LINHAS = 15;
const HORIZONTE_RESUMO_SEMANAS = 4;

function useContadorDecimal(alvo: number, casas = 1, duracaoMs = 700) {
  const [exibido, setExibido] = useState(0);
  useEffect(() => {
    let frame: number;
    const inicio = performance.now();
    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setExibido(alvo * suavizado);
      if (progresso < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [alvo, duracaoMs]);
  return exibido.toFixed(casas);
}

export default function SimulacaoPanel() {
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

  // só faz sentido projetar trechos que AINDA não são críticos — os que já
  // estão em nível 3 mostram "já crítico" em qualquer cenário, o que
  // confundia a leitura (parecia que a simulação não fazia diferença)
  const projecoesRelevantes = projetarTrechos(trechosPrioridade, cenario, climaDados).filter(
    (p) => p.trecho.nivel_semana2 < 3
  );
  const projecoes = projecoesRelevantes.slice(0, LIMITE_LINHAS);
  const restantes = projecoesRelevantes.length - projecoes.length;

  const contarProximos = (lista: ReturnType<typeof projetarTrechos>) =>
    lista.filter(
      (p) => p.trecho.nivel_semana2 < 3 && p.semanasAteCritico !== null && p.semanasAteCritico <= HORIZONTE_RESUMO_SEMANAS
    ).length;
  const resumoChuvosa = contarProximos(projetarTrechos(trechosPrioridade, "chuvosa", climaDados));
  const resumoSeca = contarProximos(projetarTrechos(trechosPrioridade, "seca", climaDados));

  const multiplicadorExibido = useContadorDecimal(multiplicador, 2);
  const chuvosaExibida = useContadorDecimal(climaDados?.precipMediaDiariaChuvosa ?? 0, 1);
  const secaExibida = useContadorDecimal(climaDados?.precipMediaDiariaSeca ?? 0, 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
          Simulação de crescimento sazonal
        </h2>
        <SimulacaoBadge />
      </div>

      <p className="mt-3 max-w-3xl font-sans text-sm leading-relaxed text-chalkdim">
        Projeta em quantas semanas cada trecho de prioridade alta ou média
        ainda não crítico atingiria o nível crítico, aplicando um
        multiplicador sazonal sobre a taxa de crescimento real medida em
        campo (13/03–20/03). Os coeficientes de época são arbitrários
        (documentados em{" "}
        <code className="font-mono text-xs text-chalk">lib/simulacao.ts</code>
        ) e ajustados pela chuva histórica da região via Open-Meteo, quando
        disponível.
      </p>

      <Reveal className="mt-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-chalkdim">
          referência real de cada nível (fotos de campo)
        </p>
        <GaleriaNiveis />
      </Reveal>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-5 border border-asphalt-700 bg-asphalt-800 p-5">
          <IconClimaAnimado cenario={cenario} />

          <div className="flex-1">
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
                  <p className="font-display text-xl font-semibold text-chalk tabular-nums">
                    {chuvosaExibida} mm
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase text-chalkdim">
                    chuva média/dia — seca
                  </p>
                  <p className="font-display text-xl font-semibold text-chalk tabular-nums">
                    {secaExibida} mm
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
        </div>
      </Reveal>

      {/* RESUMO COMPARATIVO — deixa o efeito do cenário óbvio sem ler a tabela */}
      <Reveal className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-asphalt-700 bg-asphalt-800 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-chalkdim">
              sob época chuvosa
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-route-alta tabular-nums">
              {resumoChuvosa} trechos
            </p>
            <p className="mt-1 font-sans text-xs text-chalkdim">
              ficariam críticos em até {HORIZONTE_RESUMO_SEMANAS} semanas
            </p>
          </div>
          <div className="border border-asphalt-700 bg-asphalt-800 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-chalkdim">
              sob época seca
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-route-ok tabular-nums">
              {resumoSeca} trechos
            </p>
            <p className="mt-1 font-sans text-xs text-chalkdim">
              ficariam críticos em até {HORIZONTE_RESUMO_SEMANAS} semanas
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
          cenário:
        </span>

        <div className="relative inline-flex gap-1 border border-asphalt-700 bg-asphalt-800 p-1">
          {CENARIOS.map((c) => {
            const ativo = cenario === c.valor;
            return (
              <button
                key={c.valor}
                onClick={() => setCenario(c.valor)}
                className="relative px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide"
              >
                {ativo && (
                  <motion.span
                    layoutId="cenario-pill"
                    className="absolute inset-0 bg-caution"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative z-10 ${ativo ? "text-asphalt-900" : "text-chalk"}`}>
                  {c.label} <span className="opacity-70">({c.periodo})</span>
                </span>
              </button>
            );
          })}
        </div>

        <motion.span
          key={multiplicadorExibido + (ajusteClimaAplicado ? "ajustado" : "base")}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs text-chalkdim"
        >
          multiplicador aplicado:{" "}
          <span className="font-semibold text-chalk tabular-nums">{multiplicadorExibido}x</span>
          {ajusteClimaAplicado ? " (ajustado pelo clima real)" : " (coeficiente-base)"}
        </motion.span>
      </div>

      <div className="mt-6">
        {projecoes.length === 0 ? (
          <div className="border border-dashed border-asphalt-700 p-8 text-center font-sans text-sm text-chalkdim">
            Nenhum trecho de prioridade alta ou média, ainda não crítico, para
            projetar no momento — todos os trechos monitorados nessas
            prioridades já estão em nível crítico agora.
          </div>
        ) : (
          <>
            <motion.div layout className="overflow-x-auto border border-asphalt-700">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-asphalt-700 bg-asphalt-800 font-mono text-[11px] uppercase tracking-widest text-chalkdim">
                    <th className="px-4 py-3">Zona</th>
                    <th className="px-4 py-3">Trecho</th>
                    <th className="px-4 py-3">Km</th>
                    <th className="px-4 py-3">Nível atual</th>
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
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
                      className="border-b border-asphalt-700/60 last:border-0 hover:bg-asphalt-800/60"
                    >
                      <td className="px-4 py-3">
                        <ZonaDiagrama descricao={p.trecho.descricao} />
                      </td>
                      <td className="px-4 py-3 text-chalk">{p.trecho.descricao}</td>
                      <td className="px-4 py-3 font-mono text-chalkdim">{p.trecho.km.toFixed(1)}</td>
                      <td className="px-4 py-3 font-mono text-chalkdim">{p.trecho.nivel_semana2}</td>
                      <td className="px-4 py-3 font-mono text-chalk">{p.taxaAjustada.toFixed(3)}</td>
                      <td className="px-4 py-3 font-mono text-chalk">
                        {p.semanasAteCritico === null
                          ? "não atinge"
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

            {restantes > 0 && (
              <p className="mt-3 font-mono text-xs text-chalkdim">
                +{restantes} trechos não críticos fora da lista (mostrando os {LIMITE_LINHAS} mais próximos de virar crítico)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}