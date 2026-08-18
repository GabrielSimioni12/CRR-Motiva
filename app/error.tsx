"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado na aplicação:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-caution">
        Erro inesperado
      </p>
      <h1 className="mt-4 font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
        Algo deu errado nesta tela
      </h1>
      <p className="mt-3 max-w-md font-sans text-sm text-chalkdim">
        Isso não deveria ter acontecido. Tente recarregar a tela — se o
        problema continuar, o restante do painel ainda funciona
        normalmente.
      </p>
      <button
        onClick={reset}
        className="mt-6 border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90"
      >
        Tentar de novo
      </button>
    </main>
  );
}
