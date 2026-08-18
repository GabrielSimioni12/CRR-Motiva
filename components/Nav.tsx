"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ToastAlertas from "./ToastAlertas";
import { useAlertas } from "@/lib/useAlertas";

const LINKS = [
  { href: "/", label: "Painel" },
  { href: "/mapa", label: "Mapa da rodovia" },
  { href: "/foto", label: "Classificar por foto" },
  { href: "/simulacao", label: "Simulação sazonal" },
  { href: "/tendencia", label: "Tendência" },
  { href: "/relatorio", label: "Relatório" },
  { href: "/agenda", label: "Agenda" },
];

export default function Nav() {
  const { alertas, novos, dispensarToast, dispensarTodosToasts } = useAlertas();
  const pendentes = alertas.filter((a) => a.status === "pendente").length;
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  function linkClasse(href: string) {
    const ativo = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return ativo ? "text-caution" : "hover:text-caution";
  }

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-caution focus:bg-asphalt-900 focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-caution"
      >
        Pular para o conteúdo
      </a>

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

          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="font-mono text-xs uppercase tracking-wide text-chalkdim hover:text-caution md:hidden"
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
          >
            {menuAberto ? "fechar ✕" : "menu ☰"}
          </button>

          <nav
            id="menu-principal"
            className={`${menuAberto ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-4 border-b border-asphalt-700 bg-asphalt-900 px-6 py-4 font-display text-sm uppercase tracking-wide text-chalkdim md:static md:flex md:flex-row md:flex-wrap md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuAberto(false)}
                aria-current={
                  (l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href))
                    ? "page"
                    : undefined
                }
                className={linkClasse(l.href)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/alertas"
              onClick={() => setMenuAberto(false)}
              aria-current={pathname?.startsWith("/alertas") ? "page" : undefined}
              className={`relative flex items-center gap-1.5 ${linkClasse("/alertas")}`}
            >
              Alertas
              {pendentes > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-route-alta px-1 font-mono text-[10px] text-chalk"
                  aria-label={`${pendentes} alertas pendentes`}
                >
                  {pendentes}
                </span>
              )}
            </Link>
          </nav>
        </div>

        <ToastAlertas alertas={novos} onFechar={dispensarToast} onFecharTodos={dispensarTodosToasts} />
      </header>
    </>
  );
}
