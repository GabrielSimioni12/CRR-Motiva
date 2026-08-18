import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import ComposicaoDonut from "@/components/ComposicaoDonut";
import KmPost from "@/components/KmPost";
import TabelaUrgentes from "@/components/TabelaUrgentes";
import { getResumo, getTopUrgentes } from "@/lib/data";

export default function Home() {
  const resumo = getResumo();
  const urgentes = getTopUrgentes(8);

  const fatias = [
    { valor: resumo.alta, cor: "#C4432C", label: "prioridade alta" },
    { valor: resumo.media, cor: "#D98A1F", label: "prioridade média" },
    { valor: resumo.baixa, cor: "#3F8F5F", label: "prioridade baixa" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24">
      {/* HERO — a tese do projeto */}
      <section className="border-b border-asphalt-700 py-16">
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
      </section>

      {/* MÉTRICAS */}
      <section className="grid grid-cols-2 gap-4 py-12 md:grid-cols-5">
        <MetricCard label="Trechos monitorados" value={resumo.total} />
        <MetricCard label="Prioridade alta" value={resumo.alta} tone="alta" />
        <MetricCard label="Prioridade média" value={resumo.media} tone="media" />
        <MetricCard label="Prioridade baixa" value={resumo.baixa} tone="ok" />
        <MetricCard
          label="Críticos agora"
          value={resumo.criticosAgora}
          tone="alta"
        />
      </section>

      {/* DISTRIBUIÇÃO */}
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

      {/* RÉGUA DE KM — elemento de assinatura */}
      <section className="py-6">
        <div className="km-rule mb-8" />

        <div className="flex justify-between overflow-x-auto pb-2">
          <KmPost km="0" label="início" />
          <KmPost km="7" label="serra" />
          <KmPost km="14" label="planalto" />
          <KmPost km="21" label="vale" />
          <KmPost km="29,3" label="fim" />
        </div>

        <p className="mt-6 font-sans text-sm text-chalkdim">
          A SP-021 (Rodoanel Oeste) tem 29,3 km monitorados a cada 500 metros,
          em 8 zonas de corte por trecho — canteiro central, lateral,
          marginal e dispositivos externos e internos.
        </p>
      </section>

      {/* TABELA */}
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

      {/* PROPOSTA */}
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
              Um modelo aprende a taxa de crescimento de cada trecho e projeta
              quando ele vai atingir o nível crítico, gerando uma
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
    </main>
  );
}