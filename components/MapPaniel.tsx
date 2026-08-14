"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapaPonto, Prioridade } from "@/lib/data";
import PainelDetalhePonto from "./PainelDetalhePonto";

const MapaRodovia = dynamic(() => import("./MapaRodovia"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center font-mono text-sm text-chalkdim">
            carregando mapa...
        </div>
    ),
});

const FILTROS: { valor: Prioridade; label: string; cor: string }[] = [
    { valor: "alta", label: "cortar", cor: "text-route-alta" },
    { valor: "media", label: "agendado", cor: "text-route-media" },
    { valor: "baixa", label: "ok", cor: "text-route-ok" },
    { valor: "sem_dado", label: "sem dado", cor: "text-chalkdim" },
];

export default function MapaComPainel({ pontos }: { pontos: MapaPonto[] }) {
    const pontosComId = useMemo(
        () => pontos.map((p, i) => ({ ...p, id: i })),
        [pontos]
    );

    const [ativos, setAtivos] = useState<Set<Prioridade>>(
        new Set(["alta", "media", "baixa", "sem_dado"])
    );
    const [selecionado, setSelecionado] = useState<(MapaPonto & { id: number }) | null>(
        null
    );

    function alternarFiltro(p: Prioridade) {
        setAtivos((prev) => {
            const novo = new Set(prev);
            if (novo.has(p)) {
                novo.delete(p);
            } else {
                novo.add(p);
            }
            return novo;
        });
    }

    const pontosFiltrados = useMemo(
        () => pontosComId.filter((p) => ativos.has(p.prioridade)),
        [pontosComId, ativos]
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-widest text-chalkdim">
                    filtrar:
                </span>
                {FILTROS.map((f) => {
                    const ativo = ativos.has(f.valor);
                    return (
                        <button
                            key={f.valor}
                            onClick={() => alternarFiltro(f.valor)}
                            className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-opacity ${ativo
                                    ? `border-asphalt-600 ${f.cor} opacity-100`
                                    : "border-asphalt-700 text-chalkdim opacity-40"
                                }`}
                        >
                            {f.label} ({pontosComId.filter((p) => p.prioridade === f.valor).length})
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                <div className="h-[600px] w-full border border-asphalt-700">
                    <MapaRodovia
                        pontos={pontosFiltrados}
                        selecionadoId={selecionado?.id ?? null}
                        onSelecionar={setSelecionado}
                    />
                </div>

                <div className="h-[600px]">
                    {selecionado ? (
                        <PainelDetalhePonto ponto={selecionado} onFechar={() => setSelecionado(null)} />
                    ) : (
                        <div className="flex h-full items-center justify-center border border-dashed border-asphalt-700 p-6 text-center font-sans text-sm text-chalkdim">
                            Clique em um ponto do mapa para ver os detalhes e a imagem do
                            local.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}