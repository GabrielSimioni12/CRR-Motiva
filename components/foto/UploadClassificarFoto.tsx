"use client";

import { useState } from "react";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import { Prioridade } from "@/lib/data";
import { validarImagem } from "@/lib/upload";
import { useCountUp } from "@/lib/useCountUp";

interface RegiaoAnalisada {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

interface ResultadoFoto {
  nivel: 1 | 2 | 3;
  altura_estimada_cm: number;
  confianca: "baixa" | "media" | "alta";
  justificativa: string;
  regiao_analisada?: RegiaoAnalisada;
}

const PRIORIDADE_POR_NIVEL: Record<number, Prioridade> = {
  1: "baixa",
  2: "media",
  3: "alta",
};

const COR_NIVEL: Record<number, string> = {
  1: "#3F8F5F",
  2: "#D98A1F",
  3: "#C4432C",
};

const CONFIANCA_PCT: Record<string, number> = {
  baixa: 33,
  media: 66,
  alta: 100,
};

function fileParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

// dispara o salvamento no banco sem travar a UI — se falhar, so loga no
// console, nao interrompe a experiencia de quem esta usando a tela
function salvarLeituraNoBanco(dados: {
  local: string;
  alturaCm: number;
  nivel: number;
  fonte: "foto" | "manual";
  confianca?: string;
  justificativa?: string;
}) {
  fetch("/api/leituras", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  }).catch((e) => console.error("Falha ao salvar leitura no banco:", e));
}

export default function UploadClassificarFoto() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoFoto | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [overlayVisivel, setOverlayVisivel] = useState(false);

  const alturaAnimada = useCountUp(resultado?.altura_estimada_cm ?? 0, overlayVisivel);

  async function handleArquivo(file: File | null) {
    setResultado(null);
    setErro(null);
    setOverlayVisivel(false);

    if (file) {
      const validacao = validarImagem(file.size, file.type);
      if (!validacao.ok) {
        setArquivo(null);
        setPreview(null);
        setErro(validacao.motivo);
        return;
      }
      setArquivo(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setArquivo(null);
      setPreview(null);
    }
  }

  async function classificar() {
    if (!arquivo) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    setOverlayVisivel(false);

    try {
      const imageBase64 = await fileParaBase64(arquivo);
      const resp = await fetch("/api/classificar-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType: arquivo.type }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErro(data.error ?? "Erro ao classificar a imagem");
      } else {
        setResultado(data);
        setTimeout(() => setOverlayVisivel(true), 150);

        salvarLeituraNoBanco({
          local: arquivo.name || "Foto sem nome",
          alturaCm: data.altura_estimada_cm,
          nivel: data.nivel,
          fonte: "foto",
          confianca: data.confianca,
          justificativa: data.justificativa,
        });
      }
    } catch (e) {
      console.error("Falha ao classificar imagem:", e);
      setErro("Não foi possível classificar a imagem. Verifique sua conexão e tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  function novaClassificacao() {
    setArquivo(null);
    setPreview(null);
    setResultado(null);
    setErro(null);
    setOverlayVisivel(false);
  }

  const regiao = resultado?.regiao_analisada ?? { x: 15, y: 25, largura: 70, altura: 55 };
  const corRegiao = resultado ? COR_NIVEL[resultado.nivel] : "#F2B705";
  const confPct = resultado ? CONFIANCA_PCT[resultado.confianca] : 0;

  return (
    <>
      <div className={!preview ? "mt-8 border border-dashed border-asphalt-600 bg-asphalt-900 p-8 text-center" : "mt-8"}>
        {!preview ? (
          <>
            <input
              type="file"
              accept="image/*"
              id="foto-upload"
              className="hidden"
              onChange={(e) => handleArquivo(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="foto-upload"
              className="flex cursor-pointer flex-col items-center gap-3 font-display text-sm uppercase tracking-wide text-chalkdim hover:text-caution"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              Clique para selecionar uma foto
            </label>
          </>
        ) : (
          <>
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Prévia da foto enviada" className="h-full w-full object-cover" />

              {carregando && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-asphalt-950/30" />
                  <div className="scan-line" />
                  <div className="absolute left-3 top-3 flex items-center gap-2 border border-caution/60 bg-asphalt-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-caution">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-caution" />
                    analisando imagem
                  </div>
                </div>
              )}

              {resultado && (
                <div className="pointer-events-none absolute inset-0">
                  <span
                    className="detect-corner"
                    style={{
                      left: `${regiao.x}%`,
                      top: `${regiao.y}%`,
                      borderTop: `2px solid ${corRegiao}`,
                      borderLeft: `2px solid ${corRegiao}`,
                      opacity: overlayVisivel ? 1 : 0,
                      transitionDelay: "80ms",
                    }}
                  />
                  <span
                    className="detect-corner"
                    style={{
                      left: `${regiao.x + regiao.largura}%`,
                      top: `${regiao.y}%`,
                      transform: "translateX(-100%)",
                      borderTop: `2px solid ${corRegiao}`,
                      borderRight: `2px solid ${corRegiao}`,
                      opacity: overlayVisivel ? 1 : 0,
                      transitionDelay: "140ms",
                    }}
                  />
                  <span
                    className="detect-corner"
                    style={{
                      left: `${regiao.x}%`,
                      top: `${regiao.y + regiao.altura}%`,
                      transform: "translateY(-100%)",
                      borderBottom: `2px solid ${corRegiao}`,
                      borderLeft: `2px solid ${corRegiao}`,
                      opacity: overlayVisivel ? 1 : 0,
                      transitionDelay: "140ms",
                    }}
                  />
                  <span
                    className="detect-corner"
                    style={{
                      left: `${regiao.x + regiao.largura}%`,
                      top: `${regiao.y + regiao.altura}%`,
                      transform: "translate(-100%, -100%)",
                      borderBottom: `2px solid ${corRegiao}`,
                      borderRight: `2px solid ${corRegiao}`,
                      opacity: overlayVisivel ? 1 : 0,
                      transitionDelay: "200ms",
                    }}
                  />

                  <div
                    className="absolute inset-x-0 bottom-0 border-t border-asphalt-700 bg-asphalt-950/90 px-4 py-3 backdrop-blur-sm transition-transform duration-500 ease-out"
                    style={{ transform: overlayVisivel ? "translateY(0%)" : "translateY(100%)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: corRegiao }} />
                        <p className="font-display text-2xl font-semibold text-chalk tabular-nums">
                          ~{alturaAnimada} cm
                        </p>
                        <span className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
                          nível {resultado.nivel}
                        </span>
                      </div>
                      <PrioridadeBadge prioridade={PRIORIDADE_POR_NIVEL[resultado.nivel]} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-chalkdim">
                        confiança
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-asphalt-700">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: overlayVisivel ? `${confPct}%` : "0%",
                            backgroundColor: corRegiao,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[10px] uppercase text-chalkdim">
                        {resultado.confianca}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!resultado && (
                <button
                  onClick={classificar}
                  disabled={carregando}
                  className="border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90 disabled:opacity-50"
                >
                  {carregando ? "Classificando..." : "Classificar vegetação"}
                </button>
              )}
              <button
                onClick={novaClassificacao}
                className="border border-asphalt-600 px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-chalk hover:border-chalkdim"
              >
                {resultado ? "Classificar outra foto" : "Escolher outra foto"}
              </button>
            </div>
          </>
        )}
      </div>

      {erro && (
        <div className="mt-6 border border-route-alta/40 bg-route-alta/10 p-4 font-sans text-sm text-route-alta">
          {erro}
        </div>
      )}

      {resultado && (
        <div className="mt-6 border border-asphalt-700 bg-asphalt-800 p-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            Justificativa do modelo
          </p>
          <p className="mt-2 font-sans text-sm text-chalkdim">{resultado.justificativa}</p>
        </div>
      )}

      <p className="mt-10 border-t border-asphalt-700 pt-4 font-sans text-xs text-chalkdim">
        Essa estimativa vem de um modelo de linguagem com visão interpretando
        a imagem — não é uma medição calibrada por régua/sensor, e a
        marcação sobre a foto é uma aproximação da área analisada, não uma
        segmentação exata. Próximo passo, se quisermos mais precisão:
        coletar um dataset próprio de fotos com altura real medida, para
        treinar ou calibrar um modelo especializado.
      </p>

      <style jsx>{`
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f2b705, transparent);
          box-shadow: 0 0 8px 1px rgba(242, 183, 5, 0.7);
          animation: scan 1.6s ease-in-out infinite;
        }
        @keyframes scan {
          0% { top: 4%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 96%; opacity: 0; }
        }
        .detect-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          transition: opacity 400ms ease;
        }
      `}</style>
    </>
  );
}