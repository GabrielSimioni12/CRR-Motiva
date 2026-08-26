"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconFlag,
  IconFlag2,
  IconMountain,
  IconRoad,
  IconTrendingDown,
  IconTractor,
} from "@tabler/icons-react";
import { trechosPrioridade, Prioridade } from "@/lib/data";

interface Marco {
  km: number;
  label: string;
  nome: string;
  Icone: typeof IconFlag;
  corBase: string;
  descricao: string;
}

const LARGURA_VB = 680;
const ALTURA_VB = 190;
const KM_TOTAL = 29.3;

const MARCOS: Marco[] = [
  {
    km: 0,
    label: "0",
    nome: "início",
    Icone: IconFlag,
    corBase: "#4FA3C4",
    descricao:
      "Marca o km 0 da SP-021, onde o monitoramento começa. É o ponto de partida convencionado pra organizar a rota — não representa nenhuma característica especial do terreno.",
  },
  {
    km: 7,
    label: "7",
    nome: "serra",
    Icone: IconMountain,
    corBase: "#8B5FBF",
    descricao:
      "Batizado assim porque esse trecho passa perto da Serra da Cantareira, entre Franco da Rocha e Caieiras — uma das poucas referências desse esquema baseada em geografia real.",
  },
  {
    km: 14,
    label: "14",
    nome: "planalto",
    Icone: IconRoad,
    corBase: "#C98A3D",
    descricao:
      "Nome ilustrativo pra essa faixa mais central da rota — não corresponde a um levantamento topográfico oficial, é só ambientação visual do esquema.",
  },
  {
    km: 21,
    label: "21",
    nome: "vale",
    Icone: IconTrendingDown,
    corBase: "#3E7EA6",
    descricao:
      "Outro nome ilustrativo, sugerindo variação de relevo ao longo da rota — não é dado oficial de elevação, só narrativa visual.",
  },
  {
    km: KM_TOTAL,
    label: "29,3",
    nome: "fim",
    Icone: IconFlag2,
    corBase: "#C2588B",
    descricao:
      "Marca o km 29,3, o último trecho mapeado da SP-021 nesse levantamento.",
  },
];

const CAMINHO_D =
  "M 40 150 C 160 150, 160 55, 280 55 S 420 165, 540 165 S 610 40, 640 40";

const RAIO_PROXIMIDADE = 22;
const JANELA_KM = 3.5;
const COR_CONCLUIDO = "#6B8F5C";

function calcularDadosMarco(km: number) {
  const proximos = trechosPrioridade.filter((t) => Math.abs(t.km - km) <= JANELA_KM);
  const trechosCount = proximos.length;
  const criticos = proximos.filter((t) => t.nivel_semana2 >= 3).length;
  const semCorteCount = proximos.filter((t) => t.prioridade === "baixa").length;
  const semCortePct = trechosCount > 0 ? Math.round((semCorteCount / trechosCount) * 100) : 0;

  const diasValidos = proximos
    .map((t) => t.dias_estimados_ate_critico)
    .filter((d): d is number => d !== null);
  const menorDias = diasValidos.length > 0 ? Math.min(...diasValidos) : null;
  const previsao =
    menorDias === null ? "sem dado" : menorDias === 0 ? "já crítico" : `${menorDias} dias`;

  return { trechosCount, criticos, semCortePct, previsao };
}

export default function EsquemaRota() {
  const router = useRouter();
  const [selecionadoKm, setSelecionadoKm] = useState<number | null>(null);
  const [marcoAtivo, setMarcoAtivo] = useState<number | null>(null);
  const [concluidos, setConcluidos] = useState<Set<number>>(new Set([0]));
  const [posicoes, setPosicoes] = useState<Record<number, { x: number; y: number }>>({});

  const pathFundoRef = useRef<SVGPathElement>(null);
  const pathFeitoRef = useRef<SVGPathElement>(null);
  const tratorRef = useRef<HTMLDivElement>(null);

  const dadosPorMarco = useMemo(() => {
    const mapa = new Map<number, ReturnType<typeof calcularDadosMarco>>();
    MARCOS.forEach((m) => mapa.set(m.km, calcularDadosMarco(m.km)));
    return mapa;
  }, []);

  const marcoSelecionado = MARCOS.find((m) => m.km === selecionadoKm) ?? null;
  const dadosSelecionado = selecionadoKm !== null ? dadosPorMarco.get(selecionadoKm) : null;

  useEffect(() => {
    const pathFundo = pathFundoRef.current;
    const pathFeito = pathFeitoRef.current;
    const trator = tratorRef.current;
    if (!pathFundo || !pathFeito || !trator) return;

    const comprimento = pathFundo.getTotalLength();
    pathFeito.style.strokeDasharray = `${comprimento}`;
    pathFeito.style.strokeDashoffset = `${comprimento}`;

    const novasPosicoes: Record<number, { x: number; y: number }> = {};
    MARCOS.forEach((m) => {
      const fracao = m.km / KM_TOTAL;
      const p = pathFundo.getPointAtLength(comprimento * fracao);
      novasPosicoes[m.km] = { x: p.x, y: p.y };
    });
    setPosicoes(novasPosicoes);

    const pInicial = pathFundo.getPointAtLength(0);
    trator.style.left = `${(pInicial.x / LARGURA_VB) * 100}%`;
    trator.style.top = `${(pInicial.y / ALTURA_VB) * 100}%`;

    let t = 0;
    let tAnterior = 0;
    let frame: number;

    function tick() {
      t += 0.0016;
      if (t > 1) {
        t = 0;
        tAnterior = 0;
        setConcluidos(new Set([0]));
      }

      const p = pathFundo!.getPointAtLength(comprimento * t);
      const p2 = pathFundo!.getPointAtLength(comprimento * Math.min(t + 0.01, 1));
      const anguloGraus = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;

      trator!.style.left = `${(p.x / LARGURA_VB) * 100}%`;
      trator!.style.top = `${(p.y / ALTURA_VB) * 100}%`;
      trator!.style.setProperty("--angulo", `${anguloGraus}deg`);

      pathFeito!.style.strokeDashoffset = `${comprimento * (1 - t)}`;

      const proximo = MARCOS.find(
        (m) => Math.hypot((novasPosicoes[m.km]?.x ?? 0) - p.x, (novasPosicoes[m.km]?.y ?? 0) - p.y) < RAIO_PROXIMIDADE
      );
      setMarcoAtivo(proximo ? proximo.km : null);

      MARCOS.forEach((m) => {
        const fracaoMarco = m.km / KM_TOTAL;
        if (fracaoMarco > 0 && t >= fracaoMarco && tAnterior < fracaoMarco) {
          setConcluidos((prev) => new Set(prev).add(m.km));
        }
      });

      tAnterior = t;
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${LARGURA_VB} / ${ALTURA_VB}` }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        >
          <source src="/videos/hero-rodovia-aereo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-asphalt-900/40" />

        <svg
          viewBox={`0 0 ${LARGURA_VB} ${ALTURA_VB}`}
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <path
            ref={pathFundoRef}
            d={CAMINHO_D}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="6 6"
            className="text-asphalt-600"
          />
          <path
            ref={pathFeitoRef}
            d={CAMINHO_D}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            className="text-route-ok"
          />
        </svg>

        <div
          ref={tratorRef}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ ["--angulo" as string]: "0deg" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-caution bg-asphalt-900 text-caution shadow-lg"
            style={{ transform: "rotate(var(--angulo))" }}
          >
            <IconTractor size={18} />
          </div>
        </div>

        {MARCOS.map((m) => {
          const pos = posicoes[m.km];
          if (!pos) return null;

          const feito = concluidos.has(m.km);
          const cor = feito ? COR_CONCLUIDO : m.corBase;
          const pctX = (pos.x / LARGURA_VB) * 100;
          const pctY = (pos.y / ALTURA_VB) * 100;
          const Icone = m.Icone;
          const pulsando = marcoAtivo === m.km;

          return (
            <button
              key={m.km}
              onClick={() => setSelecionadoKm(m.km)}
              style={{ left: `${pctX}%`, top: `${pctY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center transition-transform hover:scale-110"
            >
              <div className="relative mx-auto h-12 w-12">
                {pulsando && (
                  <span
                    style={{ borderColor: cor }}
                    className="absolute inset-0 animate-ping rounded-full border-2 opacity-75"
                  />
                )}
                <div
                  style={{ borderColor: cor, backgroundColor: `${cor}45`, boxShadow: `0 0 14px ${cor}55` }}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-colors duration-500"
                >
                  <Icone size={24} color={cor} stroke={2.25} />
                </div>
              </div>
              <p className="mt-1.5 font-mono text-[11px] uppercase text-chalkdim">{m.nome}</p>
              <p className="font-mono text-xs font-semibold text-chalk">km {m.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 border border-asphalt-700 bg-asphalt-800 p-5">
        {!marcoSelecionado || !dadosSelecionado ? (
          <p className="font-sans text-sm text-chalkdim">
            Toque num marco acima pra ver a descrição e os dados reais daquele trecho.
          </p>
        ) : (
          <>
            <p className="font-display text-lg font-semibold text-chalk">
              {marcoSelecionado.nome.charAt(0).toUpperCase() + marcoSelecionado.nome.slice(1)} — km{" "}
              {marcoSelecionado.label}
            </p>

            <p className="mt-2 font-sans text-sm text-chalkdim">{marcoSelecionado.descricao}</p>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-asphalt-700 pt-4">
              <div>
                <p className="font-mono text-[11px] uppercase text-chalkdim">trechos aqui</p>
                <p className="font-display text-xl font-semibold text-chalk">
                  {dadosSelecionado.trechosCount}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-chalkdim">críticos agora</p>
                <p className="font-display text-xl font-semibold text-route-alta">
                  {dadosSelecionado.criticos}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase text-chalkdim">previsão de corte</p>
                <p className="font-display text-xl font-semibold text-chalk">
                  {dadosSelecionado.previsao}
                </p>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden bg-asphalt-700">
              <div
                className="h-full bg-route-ok transition-all duration-500"
                style={{ width: `${dadosSelecionado.semCortePct}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-xs text-chalkdim">
              {dadosSelecionado.semCortePct}% do trecho sem necessidade de corte
            </p>

            <button
              onClick={() => router.push("/mapa")}
              className="mt-4 border border-asphalt-600 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk hover:border-caution hover:text-caution"
            >
              Ver esse trecho no mapa completo →
            </button>
          </>
        )}
      </div>
    </div>
  );
}