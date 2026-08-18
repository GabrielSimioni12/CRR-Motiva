import mapaRaw from "@/data/mapa.json";
import prioridadeRaw from "@/data/prioridade.json";

export type Prioridade = "alta" | "media" | "baixa" | "sem_dado";

/** Nível de vegetação considerado crítico (mesmo critério de lib/classificacao.ts: h > 30cm). */
export const NIVEL_CRITICO = 3;

export interface MapaPonto {
  tipo_rocada: string;
  centroid_lat: number;
  centroid_lon: number;
  km_estimado: number;
  km: number | null;
  nivel_atual_max: number | null;
  prioridade: Prioridade;
  dias_estimados_ate_critico: number | null;
}

export interface TrechoPrioridade {
  item_id: string | number;
  descricao: string;
  km: number;
  nivel_semana1: number;
  nivel_semana2: number;
  variacao: number;
  taxa_diaria: number;
  dias_estimados_ate_critico: number | null;
  prioridade: Prioridade;
}

export const mapaPontos = mapaRaw as MapaPonto[];
export const trechosPrioridade = prioridadeRaw as unknown as TrechoPrioridade[];

export function getResumo() {
  const total = trechosPrioridade.length;
  const alta = trechosPrioridade.filter((t) => t.prioridade === "alta").length;
  const media = trechosPrioridade.filter((t) => t.prioridade === "media").length;
  const baixa = trechosPrioridade.filter((t) => t.prioridade === "baixa").length;
  const criticosAgora = trechosPrioridade.filter((t) => t.nivel_semana2 >= NIVEL_CRITICO).length;

  return { total, alta, media, baixa, criticosAgora };
}

export function getTopUrgentes(n = 10) {
  const peso: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2, sem_dado: 3 };
  return [...trechosPrioridade]
    .sort((a, b) => {
      const p = peso[a.prioridade] - peso[b.prioridade];
      if (p !== 0) return p;
      const da = a.dias_estimados_ate_critico ?? Infinity;
      const db = b.dias_estimados_ate_critico ?? Infinity;
      return da - db;
    })
    .slice(0, n);
}
