import Link from "next/link";

export default function Nav() {
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
        <nav className="flex gap-6 font-display text-sm uppercase tracking-wide text-chalkdim">
          <Link href="/" className="hover:text-caution">
            Painel
          </Link>
          <Link href="/mapa" className="hover:text-caution">
            Mapa da rodovia
          </Link>
          <Link href="/nova-leitura" className="hover:text-caution">
            Nova leitura
          </Link>
          <Link href="/foto" className="hover:text-caution">
            Classificar por foto
          </Link>
        </nav>
      </div>
    </header>
  );
}
