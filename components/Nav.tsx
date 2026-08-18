"use client";

import Link from "next/link";
import ToastAlertas from "./ToastAlertas";
import { useAlertas } from "@/lib/useAlertas";

export default function Nav() {
  const { alertas, novos, dispensarToast, dispensarTodosToasts } = useAlertas();
  const pendentes = alertas.filter((a) => a.status === "pendente").length;

  return (
    <header className="sticky top-0 z-40 border-b border-asphalt-700 bg-asphalt-900/95 backdrop-blur">
      <div className="km-rule" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold uppercase tracking-wide text-chalk">
            SP-021
          </span>
          <span className="font-mono text-xs text-chalkdim">
            controle de vegetação
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-6 font-display text-sm uppercase tracking-wide text-chalkdim">
          <Link href="/" className="hover:text-caution">
            Painel
          </Link>
          <Link href="/mapa" className="hover:text-caution">
            Mapa da rodovia
          </Link>
          <Link href="/foto" className="hover:text-caution">
            Classificar por foto
          </Link>
          <Link href="/simulacao" className="hover:text-caution">
            Simulação sazonal
          </Link>
          <Link href="/tendencia" className="hover:text-caution">
            Tendência
          </Link>
          <Link href="/relatorio" className="hover:text-caution">
            Relatório
          </Link>
          <Link href="/agenda" className="hover:text-caution">
            Agenda
          </Link>
          <Link href="/alertas" className="relative flex items-center gap-1.5 hover:text-caution">
            Alertas
            {pendentes > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-route-alta px-1 font-mono text-[10px] text-chalk">
                {pendentes}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <ToastAlertas alertas={novos} onFechar={dispensarToast} onFecharTodos={dispensarTodosToasts} />
    </header>
  );
}