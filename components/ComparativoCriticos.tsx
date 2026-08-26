"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconTrendingDown, IconTrendingUp, IconMinus } from "@tabler/icons-react";

function useContador(alvo: number, atraso = 0, duracaoMs = 900) {
  const [exibido, setExibido] = useState(0);
  useEffect(() => {
    let frame: number;
    let timeout: ReturnType<typeof setTimeout>;
    timeout = setTimeout(() => {
      const inicio = performance.now();
      function tick(agora: number) {
        const progresso = Math.min((agora - inicio) / duracaoMs, 1);
        const suavizado = 1 - Math.pow(1 - progresso, 3);
        setExibido(Math.round(alvo * suavizado));
        if (progresso < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }, atraso);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [alvo, atraso, duracaoMs]);
  return exibido;
}

export default function ComparativoCriticos({
  antes,
  depois,
}: {
  antes: number;
  depois: number;
}) {
  const maior = Math.max(antes, depois, 1);
  const alturaMax = 90;
  const alturaAntes = (antes / maior) * alturaMax;
  const alturaDepois = (depois / maior) * alturaMax;
  const delta = depois - antes;
  const melhorou = delta < 0;
  const piorou = delta > 0;
  const corDelta = melhorou ? "#3F8F5F" : piorou ? "#C4432C" : "#A7ACA6";

  const antesExibido = useContador(antes, 500);
  const depoisExibido = useContador(depois, 900);

  const xBarraAntes = 30;
  const xBarraDepois = 78;
  const yBase = 104;
  const yTopoAntes = yBase - alturaAntes;
  const yTopoDepois = yBase - alturaDepois;

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-8 sm:text-left">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <line x1="10" y1={yBase} x2="120" y2={yBase} stroke="#32363B" strokeWidth="1" />

        <motion.path
          d={`M ${xBarraAntes + 12} ${yTopoAntes - 6} Q ${(xBarraAntes + xBarraDepois) / 2 + 6} ${Math.min(yTopoAntes, yTopoDepois) - 22}, ${xBarraDepois + 12} ${yTopoDepois - 6}`}
          fill="none"
          stroke={corDelta}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeInOut" }}
        />
        <motion.circle
          r="3"
          fill={corDelta}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, delay: 1.1, times: [0, 0.15, 0.85, 1] }}
        >
          <animateMotion
            dur="0.8s"
            begin="1.1s"
            fill="freeze"
            path={`M ${xBarraAntes + 12} ${yTopoAntes - 6} Q ${(xBarraAntes + xBarraDepois) / 2 + 6} ${Math.min(yTopoAntes, yTopoDepois) - 22}, ${xBarraDepois + 12} ${yTopoDepois - 6}`}
          />
        </motion.circle>

        <motion.rect
          x={xBarraAntes}
          width="24"
          fill="#5C6660"
          rx="2"
          initial={{ height: 0, y: yBase }}
          animate={{ height: alturaAntes, y: yTopoAntes }}
          transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.3 }}
        />
        <motion.rect
          x={xBarraDepois}
          width="24"
          fill={melhorou ? "#3F8F5F" : piorou ? "#C4432C" : "#D98A1F"}
          rx="2"
          initial={{ height: 0, y: yBase }}
          animate={{ height: alturaDepois, y: yTopoDepois }}
          transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.7 }}
        />

        <text x={xBarraAntes + 12} y="118" textAnchor="middle" className="fill-chalkdim font-mono" style={{ fontSize: 9 }}>
          13/03
        </text>
        <text x={xBarraDepois + 12} y="118" textAnchor="middle" className="fill-chalkdim font-mono" style={{ fontSize: 9 }}>
          20/03
        </text>
      </svg>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
          críticos: antes → depois
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-chalk tabular-nums">
          {antesExibido} <span className="text-chalkdim">→</span> {depoisExibido}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 1.9 }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs"
          style={{ borderColor: `${corDelta}55`, backgroundColor: `${corDelta}18`, color: corDelta }}
        >
          {melhorou ? <IconTrendingDown size={14} /> : piorou ? <IconTrendingUp size={14} /> : <IconMinus size={14} />}
          {delta === 0 ? "sem variação" : `${delta > 0 ? "+" : ""}${delta} trechos`}
        </motion.div>
      </div>
    </div>
  );
}