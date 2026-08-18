"use client";

/**
 * Ilustração de rodovia + vegetação nas margens, feita em SVG (sem imagem
 * externa) — perspectiva de asfalto com faixa tracejada e "mato" nas
 * margens em 3 alturas, ecoando os 3 níveis de classificação do projeto.
 * As lâminas de grama balançam com um CSS keyframe leve (translate + skew),
 * desligado automaticamente se o usuário preferir menos movimento.
 */
function LaminaGrama({
  x,
  altura,
  cor,
  atraso,
}: {
  x: number;
  altura: number;
  cor: string;
  atraso: number;
}) {
  return (
    <rect
      x={x}
      y={140 - altura}
      width={3}
      height={altura}
      rx={1.5}
      fill={cor}
      className="grama-lamina"
      style={{ transformOrigin: `${x + 1.5}px 140px`, animationDelay: `${atraso}ms` }}
    />
  );
}

export default function HeroRodovia() {
  const gramaEsquerda = Array.from({ length: 14 }, (_, i) => ({
    x: 4 + i * 7,
    altura: 10 + ((i * 37) % 22),
    cor: i % 5 === 0 ? "#C4432C" : i % 3 === 0 ? "#D98A1F" : "#3F8F5F",
    atraso: (i * 130) % 1600,
  }));
  const gramaDireita = Array.from({ length: 14 }, (_, i) => ({
    x: 300 + i * 7,
    altura: 10 + ((i * 29) % 22),
    cor: i % 4 === 0 ? "#D98A1F" : i % 6 === 0 ? "#C4432C" : "#3F8F5F",
    atraso: (i * 170) % 1600,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 400 160"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full opacity-90"
      >
        <defs>
          <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15171A" />
            <stop offset="100%" stopColor="#1C1F22" />
          </linearGradient>
          <linearGradient id="asfalto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#32363B" />
            <stop offset="100%" stopColor="#25282C" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="160" fill="url(#ceu)" />

        {/* margens com "grama" nos 3 níveis/cores do projeto */}
        <rect x="0" y="120" width="400" height="40" fill="#1C1F22" />
        {gramaEsquerda.map((g) => (
          <LaminaGrama key={`e-${g.x}`} {...g} />
        ))}
        {gramaDireita.map((g) => (
          <LaminaGrama key={`d-${g.x}`} {...g} />
        ))}

        {/* pista em perspectiva */}
        <polygon points="150,20 250,20 340,160 60,160" fill="url(#asfalto)" />
        <polygon points="150,20 250,20 340,160 60,160" fill="none" stroke="#43484E" strokeWidth="1" />

        {/* faixa central tracejada, mesma cor de assinatura do projeto */}
        <g fill="#F2B705">
          <polygon points="197,20 203,20 214,60 186,60" />
          <polygon points="182,72 218,72 232,112 168,112" />
          <polygon points="163,124 237,124 254,160 146,160" />
        </g>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-asphalt-900 via-asphalt-900/40 to-transparent" />

      <style jsx>{`
        .grama-lamina {
          animation: balancar 2.6s ease-in-out infinite;
        }
        @keyframes balancar {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .grama-lamina {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
