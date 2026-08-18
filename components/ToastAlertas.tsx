"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { AlertaTrecho } from "@/lib/alertas";

const DURACAO_MS = 8000;

/**
 * Mostra os alertas recém-disparados como toast. Quando vários trechos
 * cruzam o limiar crítico de uma vez (ex: primeiro carregamento com dado
 * real já crítico), agrupa num único card em vez de empilhar um toast por
 * trecho — evita enchimento de tela.
 */
export default function ToastAlertas({
  alertas,
  onFechar,
  onFecharTodos,
}: {
  alertas: AlertaTrecho[];
  onFechar: (id: string) => void;
  onFecharTodos: () => void;
}) {
  if (alertas.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {alertas.length === 1 ? (
          <ToastItem key={alertas[0].id} alerta={alertas[0]} onFechar={() => onFechar(alertas[0].id)} />
        ) : (
          <ToastAgrupado key="grupo" alertas={alertas} onFechar={onFecharTodos} />
        )}
      </AnimatePresence>
    </div>
  );
}

function useAutoFechar(onFechar: () => void) {
  useEffect(() => {
    const t = setTimeout(onFechar, DURACAO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function ToastItem({ alerta, onFechar }: { alerta: AlertaTrecho; onFechar: () => void }) {
  useAutoFechar(onFechar);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-auto border border-route-alta/50 bg-asphalt-800 p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-route-alta">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-route-alta" />
            alerta — trecho crítico
          </p>
          <p className="mt-1.5 font-sans text-sm text-chalk">
            {alerta.descricao} — km {alerta.km.toFixed(1)}
          </p>
          <p className="mt-1 font-mono text-xs text-chalkdim">nível {alerta.nivelAtingido}</p>
        </div>
        <button
          onClick={onFechar}
          className="font-mono text-xs text-chalkdim hover:text-chalk"
          aria-label="Fechar alerta"
        >
          fechar
        </button>
      </div>
    </motion.div>
  );
}

function ToastAgrupado({ alertas, onFechar }: { alertas: AlertaTrecho[]; onFechar: () => void }) {
  useAutoFechar(onFechar);
  const amostra = alertas.slice(0, 3);
  const restantes = alertas.length - amostra.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-auto border border-route-alta/50 bg-asphalt-800 p-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-route-alta">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-route-alta" />
            {alertas.length} alertas — trechos críticos
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {amostra.map((a) => (
              <li key={a.id} className="truncate font-sans text-sm text-chalk">
                {a.descricao} — km {a.km.toFixed(1)}
              </li>
            ))}
          </ul>
          {restantes > 0 && (
            <p className="mt-1 font-mono text-xs text-chalkdim">+{restantes} outros</p>
          )}
          <Link
            href="/alertas"
            onClick={onFechar}
            className="mt-2 inline-block font-mono text-xs uppercase tracking-wide text-caution hover:underline"
          >
            ver todos em alertas →
          </Link>
        </div>
        <button
          onClick={onFechar}
          className="font-mono text-xs text-chalkdim hover:text-chalk"
          aria-label="Fechar alertas"
        >
          fechar
        </button>
      </div>
    </motion.div>
  );
}
