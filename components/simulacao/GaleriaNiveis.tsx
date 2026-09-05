"use client";

import { motion } from "framer-motion";

const NIVEIS = [
  {
    nivel: 1,
    faixa: "h < 10 cm — sem necessidade de corte",
    arquivo: "/Images_classificacao/10_cm.png",
    classeCor: "text-route-ok",
    classeBorda: "border-route-ok/40",
  },
  {
    nivel: 2,
    faixa: "10–30 cm — atenção",
    arquivo: "/Images_classificacao/20_cm.png",
    classeCor: "text-route-media",
    classeBorda: "border-route-media/40",
  },
  {
    nivel: 3,
    faixa: "acima de 30 cm — nível crítico",
    arquivo: "/Images_classificacao/30_cm.png",
    classeCor: "text-route-alta",
    classeBorda: "border-route-alta/40",
  },
] as const;

export default function GaleriaNiveis() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {NIVEIS.map((n, i) => (
        <motion.div
          key={n.nivel}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" }}
          className={`overflow-hidden border bg-asphalt-800 ${n.classeBorda}`}
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-asphalt-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={n.arquivo}
              alt={`Vegetação real de nível ${n.nivel}, ${n.faixa}`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-3">
            <p className={`font-mono text-[11px] uppercase tracking-widest ${n.classeCor}`}>
              nível {n.nivel}
            </p>
            <p className="mt-0.5 font-sans text-xs text-chalkdim">{n.faixa}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}