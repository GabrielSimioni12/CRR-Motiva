import { describe, expect, it } from "vitest";
import { descreverTendencia, gerarSerieTendencia } from "./tendencia";
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

describe("gerarSerieTendencia", () => {
  it("retorna só os 2 pontos reais quando a taxa diária é zero ou negativa", () => {
    const serie = gerarSerieTendencia(trechoBase({ taxa_diaria: 0 }));
    expect(serie).toHaveLength(2);
    expect(serie.every((p) => p.nivelProjetado === undefined || p.nivelReal !== undefined)).toBe(
      true
    );
  });

  it("projeta pontos futuros quando a taxa diária é positiva", () => {
    const serie = gerarSerieTendencia(
      trechoBase({ nivel_semana1: 1, nivel_semana2: 1.5, taxa_diaria: 0.3 })
    );
    expect(serie.length).toBeGreaterThan(2);
  });

  it("para de projetar assim que o nível bruto atinge o crítico", () => {
    const serie = gerarSerieTendencia(
      trechoBase({ nivel_semana2: 2.9, taxa_diaria: 0.5 })
    );
    const ultimo = serie[serie.length - 1];
    expect(ultimo.nivelProjetado).toBeGreaterThanOrEqual(3);
  });

  it("não projeta além do horizonte máximo de 8 semanas mesmo crescendo devagar", () => {
    const serie = gerarSerieTendencia(trechoBase({ nivel_semana2: 1, taxa_diaria: 0.001 }));
    // 2 pontos reais + no máximo 8 semanas projetadas
    expect(serie.length).toBeLessThanOrEqual(10);
  });
});

describe("descreverTendencia", () => {
  it("descreve trecho já crítico", () => {
    const texto = descreverTendencia(
      trechoBase({ taxa_diaria: 0.1, dias_estimados_ate_critico: 0 })
    );
    expect(texto).toMatch(/já está em nível crítico/i);
  });

  it("descreve trecho em queda", () => {
    const texto = descreverTendencia(trechoBase({ taxa_diaria: -0.1 }));
    expect(texto).toMatch(/queda/i);
  });

  it("descreve trecho estável", () => {
    const texto = descreverTendencia(trechoBase({ taxa_diaria: 0 }));
    expect(texto).toMatch(/estável/i);
  });
});
