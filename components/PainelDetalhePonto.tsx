import { MapaPonto } from "@/lib/data";
import PrioridadeBadge from "./PrioridadeBadge";

export default function PainelDetalhePonto({
    ponto,
    onFechar,
}: {
    ponto: MapaPonto;
    onFechar: () => void;
}) {
    const streetViewEmbedSrc = `https://maps.google.com/maps?layer=c&cbll=${ponto.centroid_lat},${ponto.centroid_lon}&cbp=11,0,0,0,0&output=svembed`;
    const streetViewLink = `https://www.google.com/maps?layer=c&cbll=${ponto.centroid_lat},${ponto.centroid_lon}`;

    return (
        <div className="flex h-full flex-col border border-asphalt-700 bg-asphalt-800">
            <div className="flex items-center justify-between border-b border-asphalt-700 px-4 py-3">
                <p className="font-mono text-xs uppercase tracking-widest text-chalkdim">
                    km {ponto.km_estimado.toFixed(1)}
                </p>
                <button
                    onClick={onFechar}
                    className="font-mono text-xs text-chalkdim hover:text-chalk"
                    aria-label="Fechar"
                >
                    fechar X
                </button>
            </div>

            <div className="aspect-video w-full bg-asphalt-900">
                <iframe
                    src={streetViewEmbedSrc}
                    className="h-full w-full border-0"
                    loading="lazy"
                    title={`Street View - km ${ponto.km_estimado.toFixed(1)}`}
                />
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-semibold text-chalk">
                        {ponto.tipo_rocada}
                    </p>
                    <PrioridadeBadge prioridade={ponto.prioridade} />
                </div>

                <dl className="space-y-2 font-sans text-sm">
                    <div className="flex justify-between border-b border-asphalt-700 pb-2">
                        <dt className="text-chalkdim">Nivel atual</dt>
                        <dd className="font-mono text-chalk">
                            {ponto.nivel_atual_max ?? "sem dado"}
                        </dd>
                    </div>
                    <div className="flex justify-between border-b border-asphalt-700 pb-2">
                        <dt className="text-chalkdim">Previsao ate critico</dt>
                        <dd className="font-mono text-chalk">
                            {ponto.dias_estimados_ate_critico === null
                                ? "sem dado"
                                : ponto.dias_estimados_ate_critico === 0
                                    ? "ja critico"
                                    : `${ponto.dias_estimados_ate_critico} dias`}
                        </dd>
                    </div>
                    <div className="flex justify-between border-b border-asphalt-700 pb-2">
                        <dt className="text-chalkdim">Coordenadas</dt>
                        <dd className="font-mono text-chalk">
                            {ponto.centroid_lat.toFixed(5)}, {ponto.centroid_lon.toFixed(5)}
                        </dd>
                    </div>
                </dl>

                <a
                    href={streetViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-asphalt-600 px-4 py-2 text-center font-display text-xs font-semibold uppercase tracking-wide text-chalk hover:border-caution hover:text-caution"
                >
                    Abrir no Google Street View
                </a>
            </div>
        </div>
    );
}