"use client";

import { useEffect, useState } from "react";

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
}: {
  label: string;
  value: number;
  tone?: Tom;
}) {
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
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
  }, [value]);

  const cores = tone ? CORES[tone] : { texto: "text-chalk", borda: "border-asphalt-700" };

  return (
    <div className={`border bg-asphalt-800 p-4 ${cores.borda}`}>
      <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl font-semibold tabular-nums ${cores.texto}`}>
        {exibido}
      </p>
    </div>
  );
}