import { Prioridade } from "./data";

/**
 * Vocabulário único pros rótulos de prioridade — evita o mesmo conceito
 * (ex: prioridade "alta") aparecer como "cortar agora" numa tela e
 * "cortar" em outra. Qualquer texto novo que precise nomear uma
 * prioridade deve puxar daqui em vez de escrever a string na mão.
 */
export const LABEL_PRIORIDADE: Record<Prioridade, string> = {
  alta: "cortar agora",
  media: "agendado",
  baixa: "ok",
  sem_dado: "sem dado",
};
