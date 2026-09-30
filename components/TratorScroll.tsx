"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const COMPRIMENTO = 26; // altura do trator na vertical (px)

export default function TratorScroll() {
  const raizRef = useRef<HTMLDivElement>(null);
  const trilhaRef = useRef<HTMLDivElement>(null);
  const tratorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let quadro = 0;

    function atualizar() {
      quadro = 0;
      const alturaJanela = window.innerHeight;
      const alturaDoc = document.documentElement.scrollHeight;
      const total = alturaDoc - alturaJanela;

      // sem rolagem, sem trator
      if (raizRef.current) {
        raizRef.current.style.visibility = total > 0 ? "visible" : "hidden";
      }

      const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;

      // posição aproximada do "polegar" da barra nativa, para o trator andar junto com ele
      const alturaPolegar = Math.max(24, (alturaJanela * alturaJanela) / alturaDoc);
      const centro = p * (alturaJanela - alturaPolegar) + alturaPolegar / 2;
      const topo = Math.min(
        alturaJanela - COMPRIMENTO,
        Math.max(0, centro - COMPRIMENTO / 2)
      );

      if (tratorRef.current) {
        tratorRef.current.style.transform = `translateY(${topo}px)`;
        tratorRef.current.style.setProperty("--giro", reduzir ? "0deg" : `${p * 1440}deg`);
      }
      if (trilhaRef.current) {
        trilhaRef.current.style.height = `${topo + COMPRIMENTO / 2}px`;
      }
    }

    function agendar() {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    }

    atualizar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    const observador = new ResizeObserver(agendar);
    observador.observe(document.documentElement);

    return () => {
      if (quadro) cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      observador.disconnect();
    };
  }, [pathname]);

  return (
    <div
      ref={raizRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 right-0 z-[1100] hidden w-4 md:block"
    >
      {/* estrada tracejada, discreta */}
      <div
        className="absolute inset-y-0 right-0 w-[2px] opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #edede4 0px, #edede4 12px, transparent 12px, transparent 22px)",
        }}
      />

      {/* trilha já roçada */}
      <div
        ref={trilhaRef}
        className="absolute right-0 top-0 w-[2px] bg-[#4caf2a]/80"
        style={{ height: "0px" }}
      />

      {/* trator */}
      <div
        ref={tratorRef}
        className="absolute right-0 top-0 h-[26px] w-4 will-change-transform"
        style={{ "--giro": "0deg" } as React.CSSProperties}
      >
        <div
          className="absolute left-1/2 top-1/2 h-4 w-[26px]"
          style={{ transform: "translate(-50%, -50%) rotate(90deg) scaleY(-1)" }}
        >
          <svg viewBox="0 0 32 20" className="h-full w-full" role="presentation">
            {/* escapamento */}
            <rect x="24" y="3" width="1.8" height="5.5" rx="0.6" fill="#9aa0a6" />
            {/* capô */}
            <rect x="13" y="8" width="17" height="6.5" rx="1.6" fill="#4caf2a" />
            {/* cabine */}
            <rect x="3.5" y="2" width="11" height="10" rx="1.6" fill="#3d8f22" />
            <rect x="5" y="3.5" width="8" height="5.5" rx="0.8" fill="#cfe8ff" opacity="0.9" />
            {/* roda traseira */}
            <g style={{ transformOrigin: "9px 12.8px", transform: "rotate(var(--giro, 0deg))" }}>
              <circle cx="9" cy="12.8" r="6.5" fill="#2b2f33" stroke="#9aa0a6" strokeWidth="1.4" />
              <path d="M9 7.3V18.3M3.5 12.8H14.5" stroke="#9aa0a6" strokeWidth="1" />
              <circle cx="9" cy="12.8" r="1.6" fill="#9aa0a6" />
            </g>
            {/* roda dianteira */}
            <g style={{ transformOrigin: "26px 15.9px", transform: "rotate(var(--giro, 0deg))" }}>
              <circle cx="26" cy="15.9" r="3.5" fill="#2b2f33" stroke="#9aa0a6" strokeWidth="1.2" />
              <path d="M26 12.7V19.1M22.8 15.9H29.2" stroke="#9aa0a6" strokeWidth="0.8" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}