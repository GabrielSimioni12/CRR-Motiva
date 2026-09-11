"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NIVEL_CRITICO, TrechoPrioridade } from "@/lib/data";
import { gerarSerieTendencia } from "@/lib/tendencia";

function PontoReal(props: any) {
  const { cx, cy, index, payload, dadosLength } = props;
  if (payload?.nivelReal == null) return null;

  const ultimo = index === dadosLength - 1;
  const critico = ultimo && payload.nivelReal >= NIVEL_CRITICO;
  const emAtencao = ultimo && !critico && payload.nivelReal >= NIVEL_CRITICO - 1;

  if (!ultimo) {
    return <circle cx={cx} cy={cy} r={4} fill="#F2B705" stroke="none" />;
  }

  const cor = critico ? "#C4432C" : emAtencao ? "#D98A1F" : "#F2B705";

  return (
    <g>
      {(critico || emAtencao) && (
        <circle cx={cx} cy={cy} r={4} fill={cor} className="ponto-pulso" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      )}
      <circle cx={cx} cy={cy} r={5} fill={cor} stroke="#1C1F22" strokeWidth={1.5} />
      <style jsx>{`
        .ponto-pulso {
          animation: pulsar 1.6s ease-out infinite;
        }
        @keyframes pulsar {
          0% {
            r: 5;
            opacity: 0.6;
          }
          100% {
            r: 16;
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ponto-pulso {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </g>
  );
}

export default function GraficoTendencia({ trecho }: { trecho: TrechoPrioridade }) {
  const dados = gerarSerieTendencia(trecho);
  const topoEscala = NIVEL_CRITICO + 0.5;

  return (
    <div className="h-[360px] w-full border border-asphalt-700 bg-asphalt-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dados} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="tendenciaGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F2B705" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F2B705" stopOpacity={0} />
            </linearGradient>
          </defs>

          <ReferenceArea y1={1} y2={NIVEL_CRITICO - 1} fill="#3F8F5F" fillOpacity={0.08} strokeWidth={0} />
          <ReferenceArea y1={NIVEL_CRITICO - 1} y2={NIVEL_CRITICO} fill="#D98A1F" fillOpacity={0.08} strokeWidth={0} />
          <ReferenceArea
            y1={NIVEL_CRITICO}
            y2={topoEscala}
            fill="#C4432C"
            fillOpacity={0.14}
            strokeWidth={0}
            label={{ value: "zona crítica", fill: "#C4432C", fontSize: 11, position: "insideTopRight" }}
          />

          <CartesianGrid stroke="#32363B" strokeDasharray="3 3" />
          <XAxis
            dataKey="dataLabel"
            stroke="#A7ACA6"
            tick={{ fill: "#A7ACA6", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <YAxis
            domain={[1, topoEscala]}
            ticks={[1, 2, 3]}
            stroke="#A7ACA6"
            tick={{ fill: "#A7ACA6", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <Tooltip
            contentStyle={{
              background: "#1C1F22",
              border: "1px solid #32363B",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#EDEDE4" }}
          />
          <Legend
            wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A7ACA6" }}
          />

          <ReferenceLine y={NIVEL_CRITICO} stroke="#C4432C" strokeWidth={1.5} strokeDasharray="4 4" />

          <Area
            dataKey="nivelReal"
            stroke="none"
            fill="url(#tendenciaGradiente)"
            connectNulls
            isAnimationActive
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="nivelReal"
            name="leituras reais"
            stroke="#F2B705"
            strokeWidth={2.5}
            dot={(props: any) => <PontoReal {...props} dadosLength={dados.length} />}
            connectNulls
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="nivelProjetado"
            name="projeção de tendência"
            stroke="#EDEDE4"
            strokeWidth={2}
            strokeDasharray="6 5"
            dot={{ r: 3, fill: "#EDEDE4" }}
            connectNulls
            isAnimationActive
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}