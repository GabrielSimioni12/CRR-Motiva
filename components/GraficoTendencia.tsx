"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NIVEL_CRITICO, TrechoPrioridade } from "@/lib/data";
import { gerarSerieTendencia } from "@/lib/tendencia";

export default function GraficoTendencia({ trecho }: { trecho: TrechoPrioridade }) {
  const dados = gerarSerieTendencia(trecho);

  return (
    <div className="h-[340px] w-full border border-asphalt-700 bg-asphalt-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#32363B" strokeDasharray="3 3" />
          <XAxis
            dataKey="dataLabel"
            stroke="#A7ACA6"
            tick={{ fill: "#A7ACA6", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <YAxis
            domain={[1, NIVEL_CRITICO + 0.5]}
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
          <ReferenceLine
            y={NIVEL_CRITICO}
            stroke="#C4432C"
            strokeDasharray="4 4"
            label={{ value: "nível crítico", fill: "#C4432C", fontSize: 11, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="nivelReal"
            name="leituras reais"
            stroke="#F2B705"
            strokeWidth={2}
            dot={{ r: 4, fill: "#F2B705" }}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
