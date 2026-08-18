import { NIVEL_CRITICO, TrechoPrioridade } from "./data";
import { ResumoClimatico } from "./clima";

export type Cenario = "chuvosa" | "seca";

export const CENARIOS: { valor: Cenario; label: string; periodo: string }[] = [
  { valor: "chuvosa", label: "Época chuvosa", periodo: "out–mar" },
  { valor: "seca", label: "Época seca", periodo: "abr–set" },
];

/**
 * Modelo de crescimento sazonal — SIMULAÇÃO, não é dado medido em campo.
 *
 * Ponto de partida: a taxa_diaria de cada trecho (variação de nível entre
 * as leituras reais de 13/03 e 20/03) já capturada em data/prioridade.json.
 * Aplicamos um multiplicador sazonal arbitrário sobre essa taxa:
 *   - época chuvosa (out–mar): grama cresce mais rápido com mais água → 1.6x
 *   - época seca    (abr–set): crescimento mais lento → 0.6x
 * Esses coeficientes-base (1.6 / 0.6) foram escolhidos de forma arbitrária
 * como uma primeira aproximação e podem ser recalibrados depois com dado
 * de campo real por estação.
 *
 * Quando a Open-Meteo responde, ajustamos esse multiplicador-base pela
 * razão entre a chuva média da estação escolhida e a chuva média anual da
 * região (mais chuva que a média do ano → cresce um pouco mais rápido que
 * o coeficiente-base; menos chuva → um pouco mais devagar), limitando o
 * ajuste a ±30% para não deixar a simulação instável em anos atípicos.
 */
const MULTIPLICADOR_BASE: Record<Cenario, number> = {
  chuvosa: 1.6,
  seca: 0.6,
};

const AJUSTE_CLIMA_MIN = 0.7;
const AJUSTE_CLIMA_MAX = 1.3;

export function calcularMultiplicador(
  cenario: Cenario,
  clima: ResumoClimatico | null
): { multiplicador: number; ajusteClimaAplicado: boolean } {
  const base = MULTIPLICADOR_BASE[cenario];

  if (!clima || clima.precipMediaDiariaAnual <= 0) {
    return { multiplicador: base, ajusteClimaAplicado: false };
  }

  const precipEstacao =
    cenario === "chuvosa"
      ? clima.precipMediaDiariaChuvosa
      : clima.precipMediaDiariaSeca;

  const razao = precipEstacao / clima.precipMediaDiariaAnual;
  const ajuste = Math.min(AJUSTE_CLIMA_MAX, Math.max(AJUSTE_CLIMA_MIN, razao));

  return { multiplicador: base * ajuste, ajusteClimaAplicado: true };
}

export interface ProjecaoTrecho {
  trecho: TrechoPrioridade;
  taxaAjustada: number;
  semanasAteCritico: number | null;
}

/**
 * Projeta, para um trecho, em quantas semanas ele atingiria o nível
 * crítico (NIVEL_CRITICO) sob a taxa de crescimento ajustada pelo cenário.
 * Retorna null quando o trecho não está crescendo (taxa ajustada <= 0) ou
 * já está no nível crítico ou acima dele.
 */
export function projetarTrecho(
  trecho: TrechoPrioridade,
  multiplicador: number
): ProjecaoTrecho {
  const taxaAjustada = trecho.taxa_diaria * multiplicador;
  const distancia = NIVEL_CRITICO - trecho.nivel_semana2;

  let semanasAteCritico: number | null = null;
  if (distancia <= 0) {
    semanasAteCritico = 0;
  } else if (taxaAjustada > 0) {
    semanasAteCritico = Math.ceil(distancia / taxaAjustada / 7);
  }

  return { trecho, taxaAjustada, semanasAteCritico };
}

export function projetarTrechos(
  trechos: TrechoPrioridade[],
  cenario: Cenario,
  clima: ResumoClimatico | null
): ProjecaoTrecho[] {
  const { multiplicador } = calcularMultiplicador(cenario, clima);
  return trechos
    .filter((t) => t.prioridade === "alta" || t.prioridade === "media")
    .map((t) => projetarTrecho(t, multiplicador))
    .sort((a, b) => {
      const sa = a.semanasAteCritico ?? Infinity;
      const sb = b.semanasAteCritico ?? Infinity;
      return sa - sb;
    });
}
