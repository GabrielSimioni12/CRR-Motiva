"use client";

import { useEffect, useState } from "react";

export function useCountUp(alvo: number, ativo: boolean, duracaoMs = 900) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!ativo) {
      setValor(0);
      return;
    }
    let frame: number;
    const inicio = performance.now();
    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setValor(Math.round(alvo * suavizado));
      if (progresso < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [alvo, ativo, duracaoMs]);
  return valor;
}
