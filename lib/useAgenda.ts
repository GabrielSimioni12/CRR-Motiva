"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AgendamentoCorte,
  EVENTO_AGENDA_MUDOU,
  carregarAgendamentos,
  salvarAgendamentos,
} from "./agenda";

export function useAgenda() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoCorte[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setAgendamentos(carregarAgendamentos());
    setCarregado(true);
  }, []);

  useEffect(() => {
    function sincronizar() {
      setAgendamentos(carregarAgendamentos());
    }
    window.addEventListener(EVENTO_AGENDA_MUDOU, sincronizar);
    return () => window.removeEventListener(EVENTO_AGENDA_MUDOU, sincronizar);
  }, []);

  const adicionar = useCallback(
    (novo: Omit<AgendamentoCorte, "id" | "criadoEmISO" | "status">) => {
      const item: AgendamentoCorte = {
        ...novo,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: "agendado",
        criadoEmISO: new Date().toISOString(),
      };
      salvarAgendamentos([...carregarAgendamentos(), item]);
    },
    []
  );

  const remover = useCallback((id: string) => {
    salvarAgendamentos(carregarAgendamentos().filter((a) => a.id !== id));
  }, []);

  return { agendamentos, carregado, adicionar, remover };
}
