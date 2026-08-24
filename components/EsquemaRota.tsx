"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconFlag,
  IconFlag2,
  IconMountain,
  IconRoad,
  IconTrendingDown,
} from "@tabler/icons-react";
import { trechosPrioridade, Prioridade } from "@/lib/data";

interface Marco {
  km: number;
  label: string;
  nome: string;
  Icone: typeof IconFlag;
  x: number;
  y: number;
}

const MARCOS: Marco[] = [
  { km: 0, label: "0", nome: "início", Icone: IconFlag, x: 40, y: 150 },
  { km: 7, label: "7", nome: "serra", Icone: IconMountain, x: 280, y: 55 },
  { km: 14, label: "14", nome: "planalto", Icone: IconRoad, x: 420, y: 165 },
  { km: 21, label: "21", nome: "vale", Icone: IconTrendingDown, x: 540, y: 165 },
  { km: 29.3, label: "29,3", nome: "fim", Icone: IconFlag2, x: 640, y: 40 },
];

const JANELA_KM = 3.5;

const COR_HEX: Record<Prioridade, string> = {
  alta: "#B0503A",
  media: "#C98A3D",
  baixa: "#6B8F5C",
  sem_dado: "#5C6660",
};

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

  const prioridadeDominante: Prioridade =
    criticos > 0 ? "alta" : proximos.some((t) => t.prioridade === "media") ? "media" : "baixa";

  return { trechosCount, criticos, semCortePct, previsao, prioridadeDominante };
}

export default function EsquemaRota() {
  const router = useRouter();
  const [selecionadoKm, setSelecionadoKm] = useState<number | null>(null);

  const dadosPorMarco = useMemo(() => {
    const mapa = new Map<number, ReturnType<typeof calcularDadosMarco>>();
    MARCOS.forEach((m) => mapa.set(m.km, calcularDadosMarco(m.km)));
    return mapa;
  }, []);

  const marcoSelecionado = MARCOS.find((m) => m.km === selecionadoKm) ?? null;
  const dadosSelecionado = selecionadoKm !== null ? dadosPorMarco.get(selecionadoKm) : null;

  return (
    <div>
      <svg viewBox="0 0 680 190" className="w-full overflow-visible">
        <path
          d="M 40 150 C 160 150, 160 55, 280 55 S 420 165, 540 165 S 610 40, 640 40"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="6 6"
          className="text-asphalt-600"
        />
      </svg>

      <div className="relative -mt-[190px] h-[190px]">
        {MARCOS.map((m) => {
          const dados = dadosPorMarco.get(m.km)!;
          const cor = COR_HEX[dados.prioridadeDominante];
          const pctX = (m.x / 680) * 100;
          const pctY = (m.y / 190) * 100;
          const Icone = m.Icone;

          return (
            <button
              key={m.km}
              onClick={() => setSelecionadoKm(m.km)}
              style={{ left: `${pctX}%`, top: `${pctY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center transition-transform hover:scale-110"
            >
              <div
                style={{ borderColor: cor, backgroundColor: `${cor}22` }}
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2"
              >
                <Icone size={22} color={cor} />
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
            Toque num marco acima pra ver os dados reais daquele trecho da rota.
          </p>
        ) : (
          <>
            <p className="font-display text-lg font-semibold text-chalk">
              {marcoSelecionado.nome.charAt(0).toUpperCase() + marcoSelecionado.nome.slice(1)} — km{" "}
              {marcoSelecionado.label}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-4">
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