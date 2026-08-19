import { MapaPonto, TrechoPrioridade } from "./data";

export interface BarraDado {
  categoria: string;
  quantidade: number;
}

/** Distribuição dos pontos do mapa por tipo de equipamento de roçada. */
export function porTipoRocada(pontos: MapaPonto[]): BarraDado[] {
  const contagem = new Map<string, number>();
  pontos.forEach((p) => {
    contagem.set(p.tipo_rocada, (contagem.get(p.tipo_rocada) ?? 0) + 1);
  });
  return [...contagem.entries()]
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/** Distribuição dos trechos críticos (prioridade alta) por zona de corte. */
export function criticosPorZona(trechos: TrechoPrioridade[]): BarraDado[] {
  const contagem = new Map<string, number>();
  trechos
    .filter((t) => t.prioridade === "alta")
    .forEach((t) => {
      contagem.set(t.descricao, (contagem.get(t.descricao) ?? 0) + 1);
    });
  return [...contagem.entries()]
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}
