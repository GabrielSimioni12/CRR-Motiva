"use client";

import { useEffect, useRef, useState } from "react";
import PainelAlertas from "@/components/alertas/PainelAlertas";

export default function SinoAlertas({ pendentes }: { pendentes: number }) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function aoApertarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarEsc);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center border border-asphalt-600 text-chalkdim hover:border-chalkdim hover:text-caution"
        aria-expanded={aberto}
        aria-controls="dropdown-alertas"
        aria-haspopup="true"
        aria-label={pendentes > 0 ? `Alertas — ${pendentes} pendentes` : "Alertas"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {pendentes > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-route-alta px-1 font-mono text-[10px] text-chalk"
            aria-hidden="true"
          >
            {pendentes}
          </span>
        )}
      </button>

      {aberto && (
        <div
          id="dropdown-alertas"
          className="fixed right-4 top-[72px] z-50 w-[calc(100%-2rem)] max-w-sm border border-asphalt-700 bg-asphalt-900 p-4 shadow-lg"
        >
          <PainelAlertas compacto aoNavegarParaTrecho={() => setAberto(false)} />
        </div>
      )}
    </div>
  );
}
