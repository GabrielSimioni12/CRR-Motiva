"use client";

import { IconDroplet, IconSun } from "@tabler/icons-react";

export default function IconClimaAnimado({ cenario }: { cenario: "chuvosa" | "seca" }) {
  if (cenario === "seca") {
    return (
      <div className="flex h-14 w-14 items-center justify-center">
        <div className="sol-girando text-caution">
          <IconSun size={38} stroke={1.5} />
        </div>
        <style jsx>{`
          .sol-girando {
            animation: girar 14s linear infinite;
          }
          @keyframes girar {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .sol-girando {
              animation: none;
            }
          }
        `}</style>
      </div>
    );
  }

  const gotas = [0, 1, 2, 3, 4];
  return (
    <div className="relative h-14 w-14 overflow-hidden">
      {gotas.map((i) => (
        <span
          key={i}
          className="gota absolute top-0 text-caution"
          style={{ left: `${6 + i * 10}px`, animationDelay: `${i * 0.22}s` }}
        >
          <IconDroplet size={11} stroke={2} fill="currentColor" />
        </span>
      ))}
      <style jsx>{`
        .gota {
          animation: cair 1.1s linear infinite;
          opacity: 0;
        }
        @keyframes cair {
          0% {
            transform: translateY(-6px);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(52px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .gota {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}