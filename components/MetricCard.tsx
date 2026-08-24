"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

type Tom = "alta" | "media" | "ok" | undefined;

const CORES: Record<string, { texto: string; borda: string }> = {
  alta: { texto: "text-route-alta", borda: "border-route-alta/30" },
  media: { texto: "text-route-media", borda: "border-route-media/30" },
  ok: { texto: "text-route-ok", borda: "border-route-ok/30" },
};

export default function MetricCard({
  label,
  value,
  tone,
  atraso = 0,
  ilustracao,
  href,
}: {
  label: string;
  value: number;
  tone?: Tom;
  atraso?: number;
  ilustracao?: ReactNode;
  href?: string;
}) {
  const [exibido, setExibido] = useState(0);
  const reduzirMovimento = useReducedMotion();

  useEffect(() => {
    if (reduzirMovimento) {
      setExibido(value);
      return;
    }
    let frame: number;
    const inicio = performance.now();
    const duracao = 900;
    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setExibido(Math.round(value * suavizado));
      if (progresso < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduzirMovimento]);

  const cores = tone ? CORES[tone] : { texto: "text-chalk", borda: "border-asphalt-700" };

  const conteudo = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={href ? { y: -4 } : undefined}
      transition={{ duration: reduzirMovimento ? 0 : 0.4, delay: reduzirMovimento ? 0 : atraso, ease: "easeOut" }}
            className={`group flex h-full items-center justify-between gap-3 border bg-asphalt-800 p-5 transition-colors ${cores.borda} ${
        href ? "cursor-pointer hover:border-chalkdim" : ""
      }`}
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
          {label}
        </p>
        <p className={`mt-2 font-display text-4xl font-semibold tabular-nums ${cores.texto}`}>
          {exibido}
        </p>
        {href && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-chalkdim opacity-0 transition-opacity group-hover:opacity-100">
            ver no mapa →
          </p>
        )}
      </div>
      {ilustracao && (
        <div className={`shrink-0 opacity-80 transition-transform group-hover:scale-110 ${cores.texto}`}>
          {ilustracao}
        </div>
      )}
    </motion.div>
  );

    if (href) {
    return (
      <Link href={href} className="block h-full">
        {conteudo}
      </Link>
    );
  }
  return conteudo;
}