"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";

interface OpcaoTrecho {
  chave: string;
  descricao: string;
  km: number;
  prioridade: "alta" | "media" | "baixa" | "sem_dado";
}

const COR_PRIORIDADE: Record<string, string> = {
  alta: "text-route-alta",
  media: "text-route-media",
  baixa: "text-route-ok",
  sem_dado: "text-chalkdim",
};

export default function SeletorTrecho({
  opcoes,
  valorSelecionado,
  onSelecionar,
}: {
  opcoes: OpcaoTrecho[];
  valorSelecionado: string;
  onSelecionar: (chave: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selecionado = opcoes.find((o) => o.chave === valorSelecionado);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return opcoes;
    return opcoes.filter(
      (o) =>
        o.descricao.toLowerCase().includes(termo) ||
        o.km.toFixed(1).includes(termo)
    );
  }, [opcoes, busca]);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    if (aberto) {
      setBusca("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [aberto]);

  function selecionar(chave: string) {
    onSelecionar(chave);
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2 sm:max-w-md">
      <label className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
        Ver tendência do trecho
      </label>

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center justify-between gap-2 border border-asphalt-600 bg-asphalt-900 px-3 py-2 font-sans text-sm text-chalk outline-none hover:border-chalkdim focus:border-caution"
      >
        <span className="truncate">
          {selecionado
            ? `${selecionado.descricao} — km ${selecionado.km.toFixed(1)}`
            : "Selecione um trecho"}
        </span>
        <IconChevronDown
          size={16}
          className={`shrink-0 text-chalkdim transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-asphalt-600 bg-asphalt-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-asphalt-700 px-3 py-2">
            <IconSearch size={14} className="text-chalkdim" />
            <input
              ref={inputRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição ou km..."
              className="w-full bg-transparent font-sans text-sm text-chalk outline-none placeholder:text-chalkdim"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filtradas.length === 0 ? (
              <p className="px-3 py-4 text-center font-mono text-xs text-chalkdim">
                nenhum trecho encontrado
              </p>
            ) : (
              filtradas.map((o) => (
                <button
                  key={o.chave}
                  type="button"
                  onClick={() => selecionar(o.chave)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left font-sans text-sm hover:bg-asphalt-800 ${
                    o.chave === valorSelecionado ? "bg-asphalt-800 text-chalk" : "text-chalkdim"
                  }`}
                >
                  <span className="truncate">
                    {o.descricao} — km {o.km.toFixed(1)}
                  </span>
                  <span className={`ml-2 shrink-0 font-mono text-[10px] uppercase ${COR_PRIORIDADE[o.prioridade]}`}>
                    {o.prioridade}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}