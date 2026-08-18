import { describe, expect, it } from "vitest";
import { NIVEL_CRITICO, getResumo, getTopUrgentes, trechosPrioridade } from "./data";

describe("getResumo", () => {
  it("soma alta + media + baixa (mais sem_dado, se houver) até o total", () => {
    const r = getResumo();
    const semDado = trechosPrioridade.filter((t) => t.prioridade === "sem_dado").length;
    expect(r.alta + r.media + r.baixa + semDado).toBe(r.total);
  });

  it("criticosAgora usa o mesmo NIVEL_CRITICO exportado (regressão do achado da auditoria)", () => {
    const r = getResumo();
    const esperado = trechosPrioridade.filter((t) => t.nivel_semana2 >= NIVEL_CRITICO).length;
    expect(r.criticosAgora).toBe(esperado);
  });
});

describe("getTopUrgentes", () => {
  it("respeita o limite pedido", () => {
    expect(getTopUrgentes(5)).toHaveLength(5);
  });

  it("prioriza sempre alta antes de media antes de baixa", () => {
    const urgentes = getTopUrgentes(trechosPrioridade.length);
    const peso: Record<string, number> = { alta: 0, media: 1, baixa: 2, sem_dado: 3 };
    for (let i = 1; i < urgentes.length; i++) {
      expect(peso[urgentes[i].prioridade]).toBeGreaterThanOrEqual(peso[urgentes[i - 1].prioridade]);
    }
  });
});
