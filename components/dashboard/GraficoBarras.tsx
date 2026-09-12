"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarraDado } from "@/lib/graficosDashboard";

export default function GraficoBarras({
  titulo,
  dados,
  cor = "#F2B705",
}: {
  titulo: string;
  dados: BarraDado[];
  cor?: string;
}) {
  const total = dados.reduce((soma, d) => soma + d.quantidade, 0);
  const dadosOrdenados = [...dados].sort((a, b) => b.quantidade - a.quantidade);
  const maiorValor = dadosOrdenados[0]?.quantidade ?? 0;
  const gradId = `grad-${titulo.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

  return (
    <div className="border border-asphalt-700 bg-asphalt-800 p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">{titulo}</p>
        <p className="font-mono text-[11px] text-chalkdim">
          total: <span className="text-chalk">{total}</span>
        </p>
      </div>

      {dados.length === 0 ? (
        <p className="mt-6 font-mono text-sm text-chalkdim">sem dado pra mostrar</p>
      ) : (
        <div className="mt-3 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosOrdenados} layout="vertical" margin={{ left: 8, right: 36 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={cor} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={cor} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#32363B" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="#A7ACA6" tick={{ fill: "#A7ACA6", fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="categoria"
                stroke="#A7ACA6"
                width={140}
                tick={{ fill: "#A7ACA6", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ background: "#1C1F22", border: "1px solid #32363B", fontSize: 12 }}
                labelStyle={{ color: "#EDEDE4" }}
                formatter={(value) => {
                  const valor = Number(value ?? 0);
                  return [`${valor} (${Math.round((valor / total) * 100)}% do total)`, "quantidade"];
                }}
              />
              <Bar
                dataKey="quantidade"
                fill={`url(#${gradId})`}
                radius={[0, 3, 3, 0]}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
              >
                <LabelList
                  dataKey="quantidade"
                  position="right"
                  content={(props: any) => {
                    const { x, y, width, height, value } = props;
                    const destaque = value === maiorValor;
                    return (
                      <text
                        x={x + width + 6}
                        y={y + height / 2}
                        dy={4}
                        fontFamily="var(--font-mono)"
                        fontSize={11}
                        fontWeight={destaque ? 700 : 400}
                        fill={destaque ? "#EDEDE4" : "#A7ACA6"}
                      >
                        {value}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}