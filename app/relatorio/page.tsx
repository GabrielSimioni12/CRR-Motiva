"use client";

import { useEffect, useState } from "react";
import TabelaUrgentes from "@/components/TabelaUrgentes";
import MapaEsquematico from "@/components/MapaEsquematico";
import { getResumo, getTopUrgentes, mapaPontos } from "@/lib/data";
import { exportarRelatorioPdf } from "@/lib/pdf";

const PERIODO_REFERENCIA = "13/03/2026 – 20/03/2026";

const SECOES_RELATORIO = [
  "relatorio-cabecalho",
  "relatorio-resumo",
  "relatorio-mapa",
  "relatorio-tabela",
  "relatorio-rodape",
];

export default function RelatorioPage() {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resumo = getResumo();
  const urgentes = getTopUrgentes(10);

  // Calculado só no cliente, depois de montar: um new Date() direto no
  // render produziria um valor diferente no HTML do servidor e na
  // hidratação do cliente, gerando erro de hydration mismatch.
  const [geradoEm, setGeradoEm] = useState<string | null>(null);
  useEffect(() => {
    setGeradoEm(new Date().toLocaleString("pt-BR"));
  }, []);

  async function baixarPdf() {
    setGerando(true);
    setErro(null);
    try {
      const nomeArquivo = `relatorio-sp021-${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportarRelatorioPdf(SECOES_RELATORIO, nomeArquivo);
    } catch (e) {
      console.error("Falha ao gerar PDF do relatório:", e);
      setErro("Não foi possível gerar o PDF agora. Tente novamente.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <main id="conteudo-principal" className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
          Relatório mensal
        </h1>
        <button
          onClick={baixarPdf}
          disabled={gerando}
          className="border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90 disabled:opacity-50"
        >
          {gerando ? "gerando pdf..." : "exportar relatório em pdf"}
        </button>
      </div>

      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        Prévia do relatório, montada a partir dos mesmos dados usados no
        painel principal. O botão acima captura exatamente o que está
        abaixo e exporta como PDF.
      </p>

      {erro && (
        <div className="mt-4 border border-route-alta/40 bg-route-alta/10 p-4 font-sans text-sm text-route-alta">
          {erro}
        </div>
      )}

      {/* CONTEÚDO CAPTURADO PARA O PDF — cada bloco é exportado como uma
          seção independente, pra nunca cortar no meio de uma página */}
      <div className="mt-8 space-y-4 border border-asphalt-700 bg-asphalt-900 p-6">
        {/* cabeçalho com identidade visual do projeto */}
        <div id="relatorio-cabecalho" className="bg-asphalt-900 pb-2">
          <div className="km-rule mb-6" />
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-caution">
                Challenge CCR Motiva — FIAP
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
                SP-021 — Relatório mensal de vegetação
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase text-chalkdim">período de referência</p>
              <p className="font-mono text-xs text-chalk">{PERIODO_REFERENCIA}</p>
            </div>
          </div>
          <div className="km-rule mt-6" />
        </div>

        {/* resumo do mês */}
        <div id="relatorio-resumo" className="bg-asphalt-900 pb-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Resumo do período
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <ResumoBloco label="monitorados" valor={resumo.total} />
            <ResumoBloco label="prioridade alta" valor={resumo.alta} tom="alta" />
            <ResumoBloco label="prioridade média" valor={resumo.media} tom="media" />
            <ResumoBloco label="prioridade baixa" valor={resumo.baixa} tom="ok" />
            <ResumoBloco label="críticos agora" valor={resumo.criticosAgora} tom="alta" />
          </div>
        </div>

        {/* mapa esquemático */}
        <div id="relatorio-mapa" className="bg-asphalt-900 pb-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Distribuição espacial
          </p>
          <div className="mt-3">
            <MapaEsquematico pontos={mapaPontos} />
          </div>
        </div>

        {/* tabela de trechos priorizados */}
        <div id="relatorio-tabela" className="bg-asphalt-900 pb-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Trechos priorizados (top {urgentes.length})
          </p>
          <div className="mt-3">
            <TabelaUrgentes trechos={urgentes} />
          </div>
        </div>

        {/* rodapé */}
        <div id="relatorio-rodape" className="bg-asphalt-900 border-t border-asphalt-700 pt-4 pb-2">
          <p className="font-mono text-[10px] text-chalkdim">
            Relatório gerado automaticamente pela plataforma
            {geradoEm ? ` em ${geradoEm}` : ""}. Dados baseados nas leituras de
            campo de {PERIODO_REFERENCIA}.
          </p>
        </div>
      </div>
    </main>
  );
}

function ResumoBloco({
  label,
  valor,
  tom,
}: {
  label: string;
  valor: number;
  tom?: "alta" | "media" | "ok";
}) {
  const cor =
    tom === "alta"
      ? "text-route-alta"
      : tom === "media"
        ? "text-route-media"
        : tom === "ok"
          ? "text-route-ok"
          : "text-chalk";

  return (
    <div className="border border-asphalt-700 bg-asphalt-800 p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-chalkdim">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${cor}`}>{valor}</p>
    </div>
  );
}
