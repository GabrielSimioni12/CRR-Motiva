"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ToastAlertas from "./ToastAlertas";
import SinoAlertas from "./SinoAlertas";
import { useAlertas } from "@/lib/useAlertas";
import { MARCA } from "@/lib/marca";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/mapa", label: "Mapa da rodovia" },
  { href: "/foto", label: "Classificar por foto" },
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/FavIcon/logo_nav_escuro.png"
              alt={`Logo ${MARCA.nome}`}
              width={67}
              height={48}
              priority
              className="h-12 w-auto shrink-0"
            />
            <span className="flex items-baseline gap-2">
              <span className="font-display text-xl font-semibold tracking-wide text-chalk">
                {MARCA.nome}
              </span>
              <span className="font-mono text-xs uppercase text-chalkdim">
                {MARCA.secundario}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
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
            </nav>

            <SinoAlertas pendentes={pendentes} />

            <button
              onClick={() => setMenuAberto((v) => !v)}
              className="font-mono text-xs uppercase tracking-wide text-chalkdim hover:text-caution md:hidden"
              aria-expanded={menuAberto}
              aria-controls="menu-principal"
            >
              {menuAberto ? "fechar ✕" : "menu ☰"}
            </button>
          </div>
        </div>

        <ToastAlertas alertas={novos} onFechar={dispensarToast} onFecharTodos={dispensarTodosToasts} />
      </header>
    </>
  );
}