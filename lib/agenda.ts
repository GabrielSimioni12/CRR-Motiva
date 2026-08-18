import { Prioridade } from "./data";

// Preparado para o futuro: "confirmado" existe desde já na tipagem, mesmo
// que a interface hoje só crie/edite itens como "agendado" — quando a
// equipe de campo puder confirmar execução, basta ligar essa transição de
// status sem precisar migrar dado nenhum.
export type StatusAgendamento = "agendado" | "confirmado" | "cancelado";

export interface AgendamentoCorte {
  id: string;
  trechoDescricao: string;
  km: number;
  prioridade: Prioridade;
  data: string; // YYYY-MM-DD
  equipe: string;
  status: StatusAgendamento;
  criadoEmISO: string;
}

export const EQUIPES = [
  "Equipe Roçada Mecânica",
  "Equipe Roçada Manual",
  "Equipe Trator/Trincheira",
  "Equipe Terceirizada",
];

const CHAVE_STORAGE = "sp021_agenda_v1";
export const EVENTO_AGENDA_MUDOU = "sp021-agenda-mudou";

export function carregarAgendamentos(): AgendamentoCorte[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAVE_STORAGE);
    return raw ? (JSON.parse(raw) as AgendamentoCorte[]) : [];
  } catch {
    return [];
  }
}

export function salvarAgendamentos(agendamentos: AgendamentoCorte[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(agendamentos));
  window.dispatchEvent(new Event(EVENTO_AGENDA_MUDOU));
}
