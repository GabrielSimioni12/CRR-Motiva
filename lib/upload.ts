// Regras de upload de imagem, compartilhadas entre client (app/foto/page.tsx)
// e servidor (app/api/classificar-foto/route.ts) — mesma fonte pros dois
// lados, pra evitar o cliente aceitar algo que o servidor rejeita (ou
// pior, o servidor confiar cegamente no que o cliente diz que está enviando).
export const TIPOS_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8 MB

export function validarImagem(
  tamanhoBytes: number,
  mediaType: string
): { ok: true } | { ok: false; motivo: string } {
  if (!TIPOS_IMAGEM_PERMITIDOS.includes(mediaType)) {
    return { ok: false, motivo: "Formato de imagem não suportado." };
  }
  if (tamanhoBytes > TAMANHO_MAXIMO_BYTES) {
    return { ok: false, motivo: "Imagem maior que 8 MB." };
  }
  return { ok: true };
}
