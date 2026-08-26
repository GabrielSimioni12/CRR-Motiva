"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Fatia {
  valor: number;
  cor: string;
  label: string;
}

function useContador(alvo: number, duracaoMs = 900) {
  const [exibido, setExibido] = useState(0);
  useEffect(() => {
    let frame: number;
    const inicio = performance.now();
    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setExibido(Math.round(alvo * suavizado));
      if (progresso < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [alvo, duracaoMs]);
  return exibido;
}

export default function ComposicaoDonut({
  fatias,
  total,
}: {
  fatias: Fatia[];
  total: number;
}) {
  const [destaque, setDestaque] = useState<string | null>(null);
  const totalExibido = useContador(total);

  const raio = 62;
  const circunferencia = 2 * Math.PI * raio;
  let acumulado = 0;

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-8 sm:text-left">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={raio} fill="none" stroke="#25282C" strokeWidth="18" />
        {fatias.map((f, i) => {
          const fracao = total > 0 ? f.valor / total : 0;
          const comprimento = fracao * circunferencia;
          const offset = -acumulado;
          acumulado += comprimento;
          const emDestaque = destaque === f.label;
          const outroEmDestaque = destaque !== null && !emDestaque;

          return (
            <motion.circle
              key={f.label}
              cx="80"
              cy="80"
              r={raio}
              fill="none"
              stroke={f.cor}
              strokeWidth={emDestaque ? 24 : 18}
              strokeDasharray={`${comprimento} ${circunferencia - comprimento}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
              animate={{
                opacity: outroEmDestaque ? 0.35 : 1,
                scale: 1,
                rotate: 0,
                strokeWidth: emDestaque ? 24 : 18,
              }}
              transition={{
                opacity: { duration: 0.25 },
                strokeWidth: { type: "spring", stiffness: 300, damping: 18 },
                default: { duration: 0.6, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] },
              }}
              style={{ transformOrigin: "80px 80px", cursor: "pointer" }}
              onMouseEnter={() => setDestaque(f.label)}
              onMouseLeave={() => setDestaque(null)}
            />
          );
        })}
        <text
          x="80"
          y="80"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-chalk font-display text-2xl font-semibold tabular-nums"
        >
          {totalExibido}
        </text>
      </svg>

      <div className="space-y-2">
        {fatias.map((f) => {
          const emDestaque = destaque === f.label;
          return (
            <motion.div
              key={f.label}
              onMouseEnter={() => setDestaque(f.label)}
              onMouseLeave={() => setDestaque(null)}
              animate={{ x: emDestaque ? 4 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex cursor-pointer items-center gap-2.5 font-mono text-xs text-chalkdim"
            >
              <span
                className="h-2.5 w-2.5 transition-transform"
                style={{ backgroundColor: f.cor, transform: emDestaque ? "scale(1.4)" : "scale(1)" }}
              />
              <span className={emDestaque ? "font-semibold text-chalk" : "text-chalk"}>{f.valor}</span>
              <span className={emDestaque ? "text-chalk" : ""}>{f.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}