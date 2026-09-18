"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapaPonto, Prioridade } from "@/lib/data";
import { LABEL_PRIORIDADE } from "@/lib/labels";
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
    { valor: "alta", label: LABEL_PRIORIDADE.alta, cor: "text-route-alta" },
    { valor: "media", label: LABEL_PRIORIDADE.media, cor: "text-route-media" },
    { valor: "baixa", label: LABEL_PRIORIDADE.baixa, cor: "text-route-ok" },
    { valor: "sem_dado", label: LABEL_PRIORIDADE.sem_dado, cor: "text-chalkdim" },
];

const OPCOES_SALTO = [1, 4, 8];

type PontoComId = MapaPonto & { id: number };

// Pontos sem taxa de crescimento real medida (dado de só 1 semana, sem
// variação registrada) recebem uma taxa mínima ASSUMIDA pra fins de
// simulação — sem isso, eles ficariam "parados pra sempre" mesmo depois
// de meses sem corte, o que não é realista (grama sempre volta a
// crescer). Isso é uma estimativa ilustrativa da simulação, não dado
// medido — por isso a interface já deixa claro que é "simulação".
const DIAS_ASSUMIDOS_POR_NIVEL = 40;

function projetarPonto(p: PontoComId, semanas: number): PontoComId {
    if (semanas <= 0) return p;

    let diasBase: number;
    if (p.dias_estimados_ate_critico !== null && !Number.isNaN(Number(p.dias_estimados_ate_critico))) {
        diasBase = Number(p.dias_estimados_ate_critico);
    } else {
        const nivelAtual = p.nivel_atual_max ?? 1;
        const gapAteCritico = Math.max(3 - nivelAtual, 0.3);
        diasBase = gapAteCritico * DIAS_ASSUMIDOS_POR_NIVEL;
    }

    const diasRestantes = diasBase - semanas * 7;
    let prioridade: Prioridade = p.prioridade;

    if (diasRestantes <= 0) {
        prioridade = "alta";
    } else if (
        diasRestantes <= 14 &&
        (p.prioridade === "baixa" || p.prioridade === "sem_dado")
    ) {
        prioridade = "media";
    }

    return { ...p, prioridade, dias_estimados_ate_critico: diasRestantes };
}

const TOLERANCIA_KM_REALCE = 0.25;

export default function MapaComPainel({
    pontos,
    kmRealcado,
}: {
    pontos: MapaPonto[];
    kmRealcado?: number | null;
}) {
    const pontosComId = useMemo<PontoComId[]>(
        () => pontos.map((p, i) => ({ ...p, id: i })),
        [pontos]
    );

    const [ativos, setAtivos] = useState<Set<Prioridade>>(
        new Set(["alta", "media", "baixa", "sem_dado"])
    );
    const [selecionado, setSelecionado] = useState<PontoComId | null>(null);

    const [semanaSimulada, setSemanaSimulada] = useState(0);
    const [revelados, setRevelados] = useState<Set<number>>(new Set());
    const [animando, setAnimando] = useState(false);
    const [mudaramAgora, setMudaramAgora] = useState<Set<number>>(new Set());
    const [resumoUltimaSimulacao, setResumoUltimaSimulacao] = useState<string | null>(null);
    const alvoRef = useRef(0);
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    function simularSemanas(qtdSemanas: number) {
        if (animando) return;
        const alvo = semanaSimulada + qtdSemanas;
        alvoRef.current = alvo;
        setAnimando(true);
        setRevelados(new Set());
        setMudaramAgora(new Set());
        setResumoUltimaSimulacao(null);

        const ordem = [...pontosComId]
            .sort((a, b) => a.km_estimado - b.km_estimado)
            .map((p) => p.id);

        let i = 0;
        const passo = 14;
        intervaloRef.current = setInterval(() => {
            setRevelados((prev) => {
                const novo = new Set(prev);
                for (let k = 0; k < passo && i < ordem.length; k++, i++) {
                    novo.add(ordem[i]);
                }
                return novo;
            });
            if (i >= ordem.length) {
                if (intervaloRef.current) clearInterval(intervaloRef.current);

                const idsMudaram = new Set<number>();
                let novosCriticos = 0;
                pontosComId.forEach((p) => {
                    const antes = projetarPonto(p, semanaSimulada);
                    const depois = projetarPonto(p, alvo);
                    if (antes.prioridade !== depois.prioridade) {
                        idsMudaram.add(p.id);
                        if (depois.prioridade === "alta" && antes.prioridade !== "alta") {
                            novosCriticos++;
                        }
                    }
                });

                setMudaramAgora(idsMudaram);
                setSemanaSimulada(alvo);
                setAnimando(false);
                setRevelados(new Set());
                setResumoUltimaSimulacao(
                    idsMudaram.size === 0
                        ? `Nenhum trecho mudou de status nessas ${qtdSemanas} semana${qtdSemanas > 1 ? "s" : ""} — os pontos parados já não têm crescimento projetado.`
                        : `${idsMudaram.size} trecho${idsMudaram.size > 1 ? "s" : ""} mudou${idsMudaram.size > 1 ? "ram" : ""} de status${novosCriticos > 0 ? `, ${novosCriticos} agora crítico${novosCriticos > 1 ? "s" : ""}` : ""}.`
                );
            }
        }, 18);
    }

    function reiniciarSimulacao() {
        if (intervaloRef.current) clearInterval(intervaloRef.current);
        setAnimando(false);
        setRevelados(new Set());
        setSemanaSimulada(0);
        setMudaramAgora(new Set());
        setResumoUltimaSimulacao(null);
    }

    const pontosProjetados = useMemo(() => {
        return pontosComId.map((p) => {
            const semanasAplicar = animando
                ? revelados.has(p.id)
                    ? alvoRef.current
                    : semanaSimulada
                : semanaSimulada;
            return projetarPonto(p, semanasAplicar);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pontosComId, semanaSimulada, animando, revelados]);

    const pontosFiltrados = useMemo(
        () => pontosProjetados.filter((p) => ativos.has(p.prioridade)),
        [pontosProjetados, ativos]
    );

    const contagem = useMemo(() => {
        const c: Record<Prioridade, number> = { alta: 0, media: 0, baixa: 0, sem_dado: 0 };
        pontosProjetados.forEach((p) => { c[p.prioridade] += 1; });
        return c;
    }, [pontosProjetados]);

    const realcadosId = useMemo(() => {
        if (kmRealcado == null) return undefined;
        const ids = new Set<number>();
        pontosFiltrados.forEach((p) => {
            if (Math.abs(p.km_estimado - kmRealcado) <= TOLERANCIA_KM_REALCE) ids.add(p.id);
        });
        return ids;
    }, [pontosFiltrados, kmRealcado]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-asphalt-700 bg-asphalt-800 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 rounded-full ${semanaSimulada > 0 ? "animate-pulse bg-caution" : "bg-route-ok"}`}
                    />
                    <span className="font-mono text-xs uppercase tracking-widest text-chalkdim">
                        {semanaSimulada === 0
                            ? "visualizando dado real (13/03–20/03)"
                            : `simulação: +${semanaSimulada} semana${semanaSimulada > 1 ? "s" : ""} de crescimento`}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {semanaSimulada > 0 && (
                        <button
                            onClick={reiniciarSimulacao}
                            disabled={animando}
                            className="border border-asphalt-600 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-chalk hover:border-chalkdim disabled:opacity-40"
                        >
                            reiniciar
                        </button>
                    )}
                    {OPCOES_SALTO.map((qtd) => (
                        <button
                            key={qtd}
                            onClick={() => simularSemanas(qtd)}
                            disabled={animando}
                            className="border border-caution bg-caution px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90 disabled:opacity-50"
                        >
                            {animando ? "simulando..." : `simular +${qtd} semana${qtd > 1 ? "s" : ""}`}
                        </button>
                    ))}
                </div>
            </div>

            {resumoUltimaSimulacao && (
                <div className="border border-caution/40 bg-caution/10 px-4 py-2.5 font-sans text-sm text-caution">
                    {resumoUltimaSimulacao}
                </div>
            )}

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
                            className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-opacity ${ativo ? `border-asphalt-600 ${f.cor} opacity-100` : "border-asphalt-700 text-chalkdim opacity-40"
                                }`}
                        >
                            {f.label} ({contagem[f.valor]})
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                <div className="relative h-[600px] w-full border border-asphalt-700">
                    <MapaRodovia
                        pontos={pontosFiltrados}
                        selecionadoId={selecionado?.id ?? null}
                        onSelecionar={setSelecionado}
                        realcadosId={realcadosId}
                        mudaramAgoraId={mudaramAgora}
                    />
                    {pontosFiltrados.length === 0 && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-asphalt-900/85">
                            <p className="border border-dashed border-asphalt-700 bg-asphalt-800 px-4 py-3 text-center font-mono text-sm text-chalkdim">
                                nenhum trecho para os filtros selecionados
                            </p>
                        </div>
                    )}
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