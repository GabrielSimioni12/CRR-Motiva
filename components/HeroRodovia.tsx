"use client";

/**
 * Fundo do hero: vídeo em loop (gerado por IA) mostrando o carro passando
 * de uma via com vegetação alta para o corte ideal, com overlay escuro
 * gradiente por cima pra o texto continuar legível.
 */
export default function HeroRodovia() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-80"
      >
        <source src="/videos/hero-rodovia.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-asphalt-900/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-asphalt-900 via-asphalt-900/40 to-transparent" />
    </div>
  );
}