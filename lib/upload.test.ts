import { describe, expect, it } from "vitest";
import { TAMANHO_MAXIMO_BYTES, validarImagem } from "./upload";

describe("validarImagem", () => {
  it("aceita imagem jpeg dentro do limite de tamanho", () => {
    expect(validarImagem(1000, "image/jpeg")).toEqual({ ok: true });
  });

  it("rejeita tipo de arquivo não suportado", () => {
    const r = validarImagem(1000, "application/pdf");
    expect(r.ok).toBe(false);
  });

  it("rejeita imagem maior que o limite", () => {
    const r = validarImagem(TAMANHO_MAXIMO_BYTES + 1, "image/png");
    expect(r.ok).toBe(false);
  });

  it("aceita imagem exatamente no limite de tamanho", () => {
    expect(validarImagem(TAMANHO_MAXIMO_BYTES, "image/png").ok).toBe(true);
  });
});
