import { describe, expect, it } from "vitest";
import { classificarAltura } from "./classificacao";

describe("classificarAltura", () => {
  it("classifica altura abaixo de 10cm como nível 1 / prioridade baixa", () => {
    const r = classificarAltura(5);
    expect(r.nivel).toBe(1);
    expect(r.prioridade).toBe("baixa");
  });

  it("classifica exatamente 10cm como nível 2 (limite inclusivo)", () => {
    expect(classificarAltura(10).nivel).toBe(2);
  });

  it("classifica exatamente 30cm como nível 2 (limite inclusivo)", () => {
    expect(classificarAltura(30).nivel).toBe(2);
  });

  it("classifica acima de 30cm como nível 3 / prioridade alta", () => {
    const r = classificarAltura(31);
    expect(r.nivel).toBe(3);
    expect(r.prioridade).toBe("alta");
  });

  it("classifica 0cm como nível 1", () => {
    expect(classificarAltura(0).nivel).toBe(1);
  });
});
