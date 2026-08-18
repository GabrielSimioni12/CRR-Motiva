"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  return (
    <div className="border border-asphalt-700 bg-asphalt-800 p-4">
      <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">{titulo}</p>
      {dados.length === 0 ? (
        <p className="mt-6 font-mono text-sm text-chalkdim">sem dado pra mostrar</p>
      ) : (
        <div className="mt-3 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 16 }}>
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
              />
              <Bar dataKey="quantidade" fill={cor} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
