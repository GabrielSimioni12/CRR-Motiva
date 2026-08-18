// Rate limit simples em memória (janela fixa por IP). Reseta a cada
// restart do processo — não é distribuído nem sobrevive a múltiplas
// instâncias, mas é suficiente pra evitar abuso trivial num projeto sem
// backend/banco próprio. Se isso for pra produção real com mais de uma
// instância rodando, trocar por um rate limit num store compartilhado
// (Redis, etc).
const JANELA_MS = 60 * 1000;
const LIMITE_POR_JANELA = 8;

const contagemPorChave = new Map<string, { contagem: number; resetaEm: number }>();

export function verificarRateLimit(chave: string): { permitido: boolean; restanteMs: number } {
  const agora = Date.now();
  const registro = contagemPorChave.get(chave);

  if (!registro || agora > registro.resetaEm) {
    contagemPorChave.set(chave, { contagem: 1, resetaEm: agora + JANELA_MS });
    return { permitido: true, restanteMs: 0 };
  }

  if (registro.contagem >= LIMITE_POR_JANELA) {
    return { permitido: false, restanteMs: registro.resetaEm - agora };
  }

  registro.contagem += 1;
  return { permitido: true, restanteMs: 0 };
}
