import { describe, expect, it } from "vitest";
import { calcularMultiplicador, projetarTrecho } from "./simulacao";
import { TrechoPrioridade } from "./data";

function trechoBase(overrides: Partial<TrechoPrioridade> = {}): TrechoPrioridade {
  return {
    item_id: 1,
    descricao: "trecho teste",
    km: 0,
    nivel_semana1: 1,
    nivel_semana2: 1,
    variacao: 0,
    taxa_diaria: 0,
    dias_estimados_ate_critico: null,
    prioridade: "baixa",
    ...overrides,
  };
}

describe("calcularMultiplicador", () => {
  it("usa o coeficiente-base quando não há dado de clima", () => {
    const { multiplicador, ajusteClimaAplicado } = calcularMultiplicador("chuvosa", null);
    expect(multiplicador).toBe(1.6);
    expect(ajusteClimaAplicado).toBe(false);
  });

  it("usa o coeficiente-base de época seca quando não há dado de clima", () => {
    expect(calcularMultiplicador("seca", null).multiplicador).toBe(0.6);
  });

  it("limita o ajuste climático a no máximo 1.3x o coeficiente-base", () => {
    const climaExtremo = {
      anoReferencia: 2025,
      precipMediaDiariaChuvosa: 100,
      precipMediaDiariaSeca: 1,
      precipMediaDiariaAnual: 10,
    };
    const { multiplicador } = calcularMultiplicador("chuvosa", climaExtremo);
    expect(multiplicador).toBeCloseTo(1.6 * 1.3, 5);
  });

  it("limita o ajuste climático a no mínimo 0.7x o coeficiente-base", () => {
    const climaExtremo = {
      anoReferencia: 2025,
      precipMediaDiariaChuvosa: 0.01,
      precipMediaDiariaSeca: 0.01,
      precipMediaDiariaAnual: 10,
    };
    const { multiplicador } = calcularMultiplicador("seca", climaExtremo);
    expect(multiplicador).toBeCloseTo(0.6 * 0.7, 5);
  });
});

describe("projetarTrecho", () => {
  it("retorna 0 semanas quando o trecho já está no nível crítico", () => {
    const trecho = trechoBase({ nivel_semana2: 3 });
    expect(projetarTrecho(trecho, 1).semanasAteCritico).toBe(0);
  });

  it("retorna null quando a taxa ajustada é zero ou negativa e o trecho não é crítico", () => {
    const trecho = trechoBase({ nivel_semana2: 1, taxa_diaria: 0 });
    expect(projetarTrecho(trecho, 1).semanasAteCritico).toBeNull();
  });

  it("projeta semanas até crítico corretamente com taxa positiva", () => {
    // distância de 1 nível (2 -> 3), taxa 0.1/dia * multiplicador 1 = 0.1/dia
    // 1 / 0.1 = 10 dias -> ceil(10/7) = 2 semanas
    const trecho = trechoBase({ nivel_semana2: 2, taxa_diaria: 0.1 });
    expect(projetarTrecho(trecho, 1).semanasAteCritico).toBe(2);
  });

  it("multiplicador maior reduz as semanas necessárias", () => {
    const trecho = trechoBase({ nivel_semana2: 2, taxa_diaria: 0.1 });
    const semanasNormal = projetarTrecho(trecho, 1).semanasAteCritico ?? Infinity;
    const semanasAcelerado = projetarTrecho(trecho, 2).semanasAteCritico ?? Infinity;
    expect(semanasAcelerado).toBeLessThan(semanasNormal);
  });
});
