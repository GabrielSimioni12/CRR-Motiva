"use client";

import { useEffect, useState } from "react";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import { Prioridade } from "@/lib/data";
import { classificarAltura, ResultadoClassificacao } from "@/lib/classificacao";

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

interface LeituraManual {
  id: number;
  local: string;
  alturaCm: number;
  resultado: ResultadoClassificacao;
  horario: string;
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

const EXEMPLOS = [
  {
    nivel: 1,
    titulo: "Baixo",
    faixa: "h < 10 cm",
    desc: "Grama aparada, rente ao chão. Mal cobre a sola de um sapato.",
    barraAltura: "h-4",
    corTexto: "text-route-ok",
    corBg: "bg-route-ok",
  },
  {
    nivel: 2,
    titulo: "Médio",
    faixa: "10–30 cm",
    desc: "Passa da altura do tornozelo, chega perto do joelho.",
    barraAltura: "h-10",
    corTexto: "text-route-media",
    corBg: "bg-route-media",
  },
  {
    nivel: 3,
    titulo: "Alto",
    faixa: "> 30 cm",
    desc: "Passa do joelho, dobra sozinha com o próprio peso.",
    barraAltura: "h-16",
    corTexto: "text-route-alta",
    corBg: "bg-route-alta",
  },
] as const;

function fileParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function useCountUp(alvo: number, ativo: boolean, duracaoMs = 900) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!ativo) {
      setValor(0);
      return;
    }
    let frame: number;
    const inicio = performance.now();
    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setValor(Math.round(alvo * suavizado));
      if (progresso < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [alvo, ativo, duracaoMs]);
  return valor;
}

export default function ClassificarPorFotoPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoFoto | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [overlayVisivel, setOverlayVisivel] = useState(false);

  const [local, setLocal] = useState("");
  const [altura, setAltura] = useState("");
  const [leituras, setLeituras] = useState<LeituraManual[]>([]);

  const alturaAnimada = useCountUp(
    resultado?.altura_estimada_cm ?? 0,
    overlayVisivel
  );

  async function handleArquivo(file: File | null) {
    setResultado(null);
    setErro(null);
    setOverlayVisivel(false);
    setArquivo(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
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
      }
    } catch (e) {
      setErro(String(e));
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

  function handleSubmitManual(e: React.FormEvent) {
    e.preventDefault();
    const alturaNum = parseFloat(altura.replace(",", "."));
    if (isNaN(alturaNum) || alturaNum < 0) return;

    const resultadoManual = classificarAltura(alturaNum);
    const nova: LeituraManual = {
      id: Date.now(),
      local: local.trim() || "Ponto sem nome",
      alturaCm: alturaNum,
      resultado: resultadoManual,
      horario: new Date().toLocaleTimeString("pt-BR"),
    };
    setLeituras((prev) => [nova, ...prev]);
    setLocal("");
    setAltura("");
  }

  const regiao = resultado?.regiao_analisada ?? { x: 15, y: 25, largura: 70, altura: 55 };
  const corRegiao = resultado ? COR_NIVEL[resultado.nivel] : "#F2B705";
  const confPct = resultado ? CONFIANCA_PCT[resultado.confianca] : 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 inline-block border border-caution/50 bg-caution/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-caution">
        Protótipo — classificação por IA multimodal
      </div>

      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
        Classificar por foto
      </h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        Envie uma foto do trecho e um modelo de IA com visão estima a altura
        da vegetação e classifica no mesmo padrão usado nos dados reais da
        SP-021. É uma estimativa visual — não substitui uma medição
        calibrada, mas já valida a ideia sem precisar treinar um modelo do
        zero.
      </p>

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

      <section className="mt-14 border-t border-asphalt-700 pt-10">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
          Como tirar a foto
        </h2>
        <ul className="mt-4 space-y-2 font-sans text-sm text-chalkdim">
          <li>— Fotografe de pé, apontando a câmera para baixo, em direção ao mato.</li>
          <li>— Tente incluir algo de referência na cena (seu pé, uma trena, o meio-fio) — ajuda o modelo a estimar escala.</li>
          <li>— Evite fotos muito de longe ou contra a luz (sol atrás do mato).</li>
          <li>— Uma foto por vez, de um trecho só, é melhor que uma foto panorâmica de vários pontos.</li>
        </ul>

        <h3 className="mt-10 font-display text-sm font-semibold uppercase tracking-wide text-chalkdim">
          Referência de níveis
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {EXEMPLOS.map((ex) => (
            <div key={ex.nivel} className="border border-asphalt-700 bg-asphalt-800 p-4">
              <div className="flex h-16 items-end justify-center gap-1 border-b border-asphalt-700 pb-2">
                <div className={`w-3 ${ex.barraAltura} ${ex.corBg}`} />
                <div className={`w-3 ${ex.barraAltura} ${ex.corBg} opacity-70`} />
                <div className={`w-3 ${ex.barraAltura} ${ex.corBg} opacity-40`} />
              </div>
              <p className={`mt-3 font-display text-sm font-semibold uppercase tracking-wide ${ex.corTexto}`}>
                Nível {ex.nivel} — {ex.titulo}
              </p>
              <p className="font-mono text-xs text-chalkdim">{ex.faixa}</p>
              <p className="mt-2 font-sans text-xs text-chalkdim">{ex.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-asphalt-700 pt-10">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
          Nova leitura manual
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
          Prefere medir com trena em vez de foto? Digite a altura direto
          aqui — a plataforma classifica na hora, com a mesma regra usada
          acima e nos dados reais da SP-021.
        </p>

        <form onSubmit={handleSubmitManual} className="mt-6 flex flex-wrap items-end gap-4 border border-asphalt-700 bg-asphalt-800 p-5">
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
    </main>
  );
}