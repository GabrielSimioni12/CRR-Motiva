import { describe, expect, it } from "vitest";
import { verificarRateLimit } from "./rateLimit";

describe("verificarRateLimit", () => {
  it("permite requisições dentro do limite e bloqueia depois", () => {
    const chave = `teste-${Math.random()}`;
    const resultados = Array.from({ length: 10 }, () => verificarRateLimit(chave));
    const permitidos = resultados.filter((r) => r.permitido).length;
    const bloqueados = resultados.filter((r) => !r.permitido).length;

    expect(permitidos).toBe(8);
    expect(bloqueados).toBe(2);
  });

  it("mantém chaves diferentes independentes uma da outra", () => {
    const chaveA = `a-${Math.random()}`;
    const chaveB = `b-${Math.random()}`;

    for (let i = 0; i < 8; i++) verificarRateLimit(chaveA);

    expect(verificarRateLimit(chaveA).permitido).toBe(false);
    expect(verificarRateLimit(chaveB).permitido).toBe(true);
  });
});
