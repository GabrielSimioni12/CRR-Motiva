import { Suspense } from "react";
import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import ComposicaoDonut from "@/components/ComposicaoDonut";
import KmPost from "@/components/KmPost";
import TabelaUrgentes from "@/components/TabelaUrgentes";
import HeroRodovia from "@/components/HeroRodovia";
import Reveal from "@/components/Reveal";
import PainelDados from "@/components/dashboard/PainelDados";
import { getResumo, getTopUrgentes } from "@/lib/data";
import GramaIlustracao from "@/components/ilustracoes/GramaIlustracao";
import RotaIlustracao from "@/components/ilustracoes/RotaIlustracao";
import AlertaIlustracao from "@/components/ilustracoes/AlertaIlustracao";
import EsquemaRota from "@/components/EsquemaRota";
export default function Home() {
  const resumo = getResumo();
  const urgentes = getTopUrgentes(8);

  const fatias = [
    { valor: resumo.alta, cor: "#C4432C", label: "prioridade alta" },
    { valor: resumo.media, cor: "#D98A1F", label: "prioridade média" },
    { valor: resumo.baixa, cor: "#3F8F5F", label: "prioridade baixa" },
  ];

  return (
    <main id="conteudo-principal" className="mx-auto max-w-6xl px-6 pb-24">
      {/* HERO — a tese do projeto */}
      <section className="relative -mx-6 overflow-hidden border-b border-asphalt-700 px-6 py-20">
        <HeroRodovia />

        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest text-caution">
            Challenge CCR Motiva — FIAP
          </p>

          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-chalk">
            A roçada não devia obedecer a um calendário.
            <br />
            Devia obedecer à grama.
          </h1>

          <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-chalkdim">
            Hoje o corte de vegetação na SP-021 segue um cronograma fixo, sem
            considerar se o trecho realmente precisa. Este painel cruza duas
            leituras reais de campo — 13/03 e 20/03 — para calcular a taxa de
            crescimento de cada trecho e decidir, com dado, quando e onde
            intervir.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/mapa"
              className="border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90"
            >
              Ver mapa da rodovia
            </Link>

            <a
              href="#proposta"
              className="border border-asphalt-600 px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-chalk hover:border-chalkdim"
            >
              Como funciona
            </a>
          </div>
        </div>
      </section>

       {/* MÉTRICAS */}
      <section className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Trechos monitorados"
          value={resumo.total}
          atraso={0}
          href="/mapa"
          ilustracao={<RotaIlustracao />}
        />
        <MetricCard
          label="Prioridade alta"
          value={resumo.alta}
          tone="alta"
          atraso={0.06}
          href="/mapa"
          ilustracao={<GramaIlustracao nivel={3} />}
        />
        <MetricCard
          label="Prioridade média"
          value={resumo.media}
          tone="media"
          atraso={0.12}
          href="/mapa"
          ilustracao={<GramaIlustracao nivel={2} />}
        />
        <MetricCard
          label="Prioridade baixa"
          value={resumo.baixa}
          tone="ok"
          atraso={0.18}
          href="/mapa"
          ilustracao={<GramaIlustracao nivel={1} />}
        />
        <MetricCard
          label="Críticos agora"
          value={resumo.criticosAgora}
          tone="alta"
          atraso={0.24}
          href="/mapa"
          ilustracao={<AlertaIlustracao />}
        />
      </section>

      {/* DISTRIBUIÇÃO */}
      <Reveal>
        <section className="border-t border-asphalt-700 py-12">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
            Distribuição de prioridades
          </h2>

          <p className="mt-1 font-sans text-sm text-chalkdim">
            Como os {resumo.total} trechos monitorados se dividem hoje, com
            base na variação real entre as duas leituras de campo.
          </p>

          <div className="mt-6">
            <ComposicaoDonut fatias={fatias} total={resumo.total} />
          </div>
        </section>
      </Reveal>

           {/* ESQUEMA DE ROTA — elemento de assinatura, interativo com dado real */}
      <Reveal>
        <section className="py-6">
          <div className="km-rule mb-8" />

          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
            Relevo da rota
          </h2>
          <p className="mt-1 mb-6 font-sans text-sm text-chalkdim">
            A SP-021 (Rodoanel Oeste) tem 29,3 km monitorados a cada 500
            metros. Toque em qualquer marco pra ver os dados reais daquele
            trecho.
          </p>

          <EsquemaRota />
        </section>
      </Reveal>

      {/* TENDÊNCIA / SIMULAÇÃO — sub-tabs. O mapa completo vive em /mapa,
          numa página própria (é pesado demais pra manter montado à toa
          dentro do dashboard). */}
      <Reveal>
        <section className="border-t border-asphalt-700 py-12">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
            Tendência e simulação
          </h2>
          <p className="mt-1 font-sans text-sm text-chalkdim">
            Veja a tendência de crescimento por trecho, ou explore a
            simulação de cenário sazonal — cada uma numa aba, pra não
            misturar dado de campo com projeção simulada. Para ver todos os
            pontos no mapa, acesse a aba{" "}
            <Link href="/mapa" className="text-caution underline">
              Mapa da rodovia
            </Link>{" "}
            no menu.
          </p>
          <div className="mt-6">
            <Suspense fallback={<p className="font-mono text-sm text-chalkdim">carregando...</p>}>
              <PainelDados />
            </Suspense>
          </div>
        </section>
      </Reveal>

      {/* TABELA */}
      <Reveal>
        <section className="py-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
              Trechos mais urgentes
            </h2>

            <span className="font-mono text-xs text-chalkdim">
              baseado na variação real entre 13/03 e 20/03
            </span>
          </div>

          <TabelaUrgentes trechos={urgentes} />
        </section>
      </Reveal>

      {/* PROPOSTA */}
      <Reveal>
        <section
          id="proposta"
          className="scroll-mt-24 border-t border-asphalt-700 py-16"
        >
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
            A proposta
          </h2>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-caution">
                Entrada
              </p>

              <p className="mt-2 font-sans text-sm leading-relaxed text-chalkdim">
                Leituras de campo por trecho (hoje manuais, no futuro por
                sensor), classificando a altura da vegetação em 3 níveis.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-caution">
                Processamento
              </p>

              <p className="mt-2 font-sans text-sm leading-relaxed text-chalkdim">
                Um modelo aprende a taxa de crescimento de cada trecho e
                projeta quando ele vai atingir o nível crítico, gerando uma
                priorização automática.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-caution">
                Saída
              </p>

              <p className="mt-2 font-sans text-sm leading-relaxed text-chalkdim">
                Mapa e painel mostrando exatamente onde cortar primeiro —
                substituindo o cronograma fixo por decisão orientada a dado.
              </p>
            </div>
          </div>

          <div className="mt-10 border border-asphalt-700 bg-asphalt-800 p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-chalkdim">
              Ganho para a Motiva
            </p>

            <p className="mt-2 font-sans text-sm leading-relaxed text-chalk">
              Menos roçada desnecessária em trechos que ainda não precisam,
              menos risco em trechos críticos que hoje só são notados na
              próxima inspeção, e uma equipe que sabe, antes de sair a campo,
              exatamente onde o problema está.
            </p>
          </div>
        </section>
      </Reveal>
    </main>
  );
}