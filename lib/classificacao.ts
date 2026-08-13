import { Prioridade } from "./data";

export interface ResultadoClassificacao {
  nivel: 1 | 2 | 3;
  descricaoNivel: string;
  prioridade: Prioridade;
  recomendacao: string;
}

/**
 * Mesma regra de classificação usada nos dados reais da Motiva:
 *   nível 1 = h < 10 cm
 *   nível 2 = 10 <= h <= 30 cm
 *   nível 3 = h > 30 cm
 */
export function classificarAltura(alturaCm: number): ResultadoClassificacao {
  let nivel: 1 | 2 | 3;
  let descricaoNivel: string;

  if (alturaCm < 10) {
    nivel = 1;
    descricaoNivel = "h < 10 cm";
  } else if (alturaCm <= 30) {
    nivel = 2;
    descricaoNivel = "10 cm ≤ h ≤ 30 cm";
  } else {
    nivel = 3;
    descricaoNivel = "h > 30 cm";
  }

  const prioridade: Prioridade = nivel === 3 ? "alta" : nivel === 2 ? "media" : "baixa";
  const recomendacao =
    nivel === 3
      ? "Cortar agora — trecho em nível crítico."
      : nivel === 2
        ? "Agendar corte nos próximos dias."
        : "Sem necessidade de corte no momento.";

  return { nivel, descricaoNivel, prioridade, recomendacao };
}
