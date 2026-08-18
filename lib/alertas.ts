import { NIVEL_CRITICO, TrechoPrioridade, trechosPrioridade } from "./data";

export type StatusAlerta = "pendente" | "visto";

export interface AlertaTrecho {
  id: string;
  descricao: string;
  km: number;
  nivelAtingido: number;
  dataHoraISO: string;
  status: StatusAlerta;
}

const CHAVE_STORAGE = "sp021_alertas_v1";
export const EVENTO_ALERTAS_MUDOU = "sp021-alertas-mudou";

function idTrecho(t: TrechoPrioridade): string {
  return `${t.item_id}-${t.km}`;
}

/** Trechos que hoje estão no nível crítico — mesmo NIVEL_CRITICO usado no resto da plataforma. */
export function trechosCriticos(): TrechoPrioridade[] {
  return trechosPrioridade.filter((t) => t.nivel_semana2 >= NIVEL_CRITICO);
}

export function carregarAlertas(): AlertaTrecho[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAVE_STORAGE);
    return raw ? (JSON.parse(raw) as AlertaTrecho[]) : [];
  } catch {
    return [];
  }
}

export function salvarAlertas(alertas: AlertaTrecho[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(alertas));
  // Notifica outras instâncias do hook (ex: Nav e a página /alertas ao mesmo
  // tempo) já que o evento nativo "storage" não dispara na mesma aba.
  window.dispatchEvent(new Event(EVENTO_ALERTAS_MUDOU));
}

/**
 * Compara os trechos críticos atuais com os alertas já registrados e
 * retorna só os alertas NOVOS — simula o momento em que um trecho "cruza"
 * o limiar crítico e ainda não tinha gerado alerta.
 */
export function detectarNovosAlertas(existentes: AlertaTrecho[]): AlertaTrecho[] {
  const idsExistentes = new Set(existentes.map((a) => a.id));
  const agora = new Date().toISOString();
  return trechosCriticos()
    .filter((t) => !idsExistentes.has(idTrecho(t)))
    .map((t) => ({
      id: idTrecho(t),
      descricao: t.descricao,
      km: t.km,
      nivelAtingido: t.nivel_semana2,
      dataHoraISO: agora,
      status: "pendente" as StatusAlerta,
    }));
}
