"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertaTrecho,
  EVENTO_ALERTAS_MUDOU,
  carregarAlertas,
  detectarNovosAlertas,
  salvarAlertas,
} from "./alertas";

// Módulo compartilhado entre todas as instâncias do hook nesta aba: garante
// que a detecção de novos alertas (e o toast) só dispara uma vez por sessão
// de navegação, mesmo se o hook for usado em vários componentes (Nav + página).
let detectadoNestaSessao = false;

export function useAlertas() {
  const [alertas, setAlertas] = useState<AlertaTrecho[]>([]);
  const [novos, setNovos] = useState<AlertaTrecho[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const existentes = carregarAlertas();

    if (!detectadoNestaSessao) {
      detectadoNestaSessao = true;
      const detectados = detectarNovosAlertas(existentes);
      if (detectados.length > 0) {
        const combinados = [...detectados, ...existentes];
        salvarAlertas(combinados);
        setAlertas(combinados);
        setNovos(detectados);
        setCarregado(true);
        return;
      }
    }

    setAlertas(existentes);
    setCarregado(true);
  }, []);

  useEffect(() => {
    function sincronizar() {
      setAlertas(carregarAlertas());
    }
    window.addEventListener(EVENTO_ALERTAS_MUDOU, sincronizar);
    return () => window.removeEventListener(EVENTO_ALERTAS_MUDOU, sincronizar);
  }, []);

  const marcarVisto = useCallback((id: string) => {
    const atualizado = carregarAlertas().map((a) =>
      a.id === id ? { ...a, status: "visto" as const } : a
    );
    salvarAlertas(atualizado);
  }, []);

  const marcarTodosVistos = useCallback(() => {
    const atualizado = carregarAlertas().map((a) => ({ ...a, status: "visto" as const }));
    salvarAlertas(atualizado);
  }, []);

  const dispensarToast = useCallback((id: string) => {
    setNovos((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dispensarTodosToasts = useCallback(() => setNovos([]), []);

  return {
    alertas,
    novos,
    carregado,
    marcarVisto,
    marcarTodosVistos,
    dispensarToast,
    dispensarTodosToasts,
  };
}
