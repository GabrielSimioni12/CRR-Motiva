"use client";

import { useEffect, useState } from "react";

interface Fatia {
    valor: number;
    cor: string;
    label: string;
}

export default function ComposicaoDonut({
    fatias,
    total,
}: {
    fatias: Fatia[];
    total: number;
}) {
    const [animado, setAnimado] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimado(true), 120);
        return () => clearTimeout(t);
    }, []);

    const raio = 62;
    const circunferencia = 2 * Math.PI * raio;
    let acumulado = 0;

    return (
        <div className="flex flex-wrap items-center gap-8">
            <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={raio} fill="none" stroke="#25282C" strokeWidth="18" />
                {fatias.map((f, i) => {
                    const fracao = total > 0 ? f.valor / total : 0;
                    const comprimento = fracao * circunferencia;
                    const offset = -acumulado;
                    acumulado += comprimento;
                    return (
                        <circle
                            key={f.label}
                            cx="80"
                            cy="80"
                            r={raio}
                            fill="none"
                            stroke={f.cor}
                            strokeWidth="18"
                            strokeDasharray={`${comprimento} ${circunferencia - comprimento}`}
                            strokeDashoffset={offset}
                            strokeLinecap="butt"
                            style={{
                                opacity: animado ? 1 : 0,
                                transformOrigin: "80px 80px",
                                transform: animado ? "scale(1)" : "scale(0.75)",
                                transition: `opacity 550ms ease ${i * 160}ms, transform 550ms cubic-bezier(0.34,1.56,0.64,1) ${i * 160}ms`,
                            }}
                        />
                    );
                })}
                <text x="80" y="80" textAnchor="middle" dominantBaseline="central" className="fill-chalk font-display text-2xl font-semibold">
                    {total}
                </text>
            </svg>

            <div className="space-y-3">
                {fatias.map((f) => (
                    <div key={f.label} className="flex items-center gap-2.5 font-mono text-xs text-chalkdim">
                        <span className="h-2.5 w-2.5" style={{ backgroundColor: f.cor }} />
                        <span className="text-chalk">{f.valor}</span>
                        <span>{f.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}