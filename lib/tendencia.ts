import { NIVEL_CRITICO, TrechoPrioridade } from "./data";

// Datas das duas leituras reais de campo usadas em todo o projeto.
const DATA_LEITURA_1 = new Date(2026, 2, 13); // 13/03/2026
const DATA_LEITURA_2 = new Date(2026, 2, 20); // 20/03/2026
const HORIZONTE_MAX_SEMANAS = 8; // limite de semanas projetadas quando o trecho não atinge o crítico

export interface PontoTendencia {
  dataLabel: string;
  nivelReal?: number;
  nivelProjetado?: number;
}

function formatarData(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/**
 * Monta a série de pontos pra o gráfico de um trecho: os dois níveis reais
 * medidos em campo, seguidos por uma projeção semanal usando a mesma
 * taxa_diaria já calculada no pipeline (nível/dia), até o trecho atingir
 * NIVEL_CRITICO ou até HORIZONTE_MAX_SEMANAS, o que vier primeiro. O ponto
 * da segunda leitura real aparece duplicado como início da projeção, pra
 * a linha tracejada conectar visualmente com a linha sólida.
 */
export function gerarSerieTendencia(trecho: TrechoPrioridade): PontoTendencia[] {
  const pontos: PontoTendencia[] = [
    { dataLabel: formatarData(DATA_LEITURA_1), nivelReal: trecho.nivel_semana1 },
    {
      dataLabel: formatarData(DATA_LEITURA_2),
      nivelReal: trecho.nivel_semana2,
      nivelProjetado: trecho.nivel_semana2,
    },
  ];

  if (trecho.taxa_diaria <= 0) {
    return pontos;
  }

  for (let semana = 1; semana <= HORIZONTE_MAX_SEMANAS; semana++) {
    const dataProjetada = new Date(DATA_LEITURA_2);
    dataProjetada.setDate(dataProjetada.getDate() + semana * 7);

    const nivelBruto = trecho.nivel_semana2 + trecho.taxa_diaria * 7 * semana;
    const nivelProjetado = Math.min(nivelBruto, NIVEL_CRITICO + 0.2);

    pontos.push({ dataLabel: formatarData(dataProjetada), nivelProjetado });

    if (nivelBruto >= NIVEL_CRITICO) break;
  }

  return pontos;
}

export function descreverTendencia(trecho: TrechoPrioridade): string {
  if (trecho.taxa_diaria > 0) {
    if (trecho.dias_estimados_ate_critico === 0) {
      return "Já está em nível crítico.";
    }
    if (trecho.dias_estimados_ate_critico !== null) {
      return `Crescendo — projeção alcança o nível crítico em ${trecho.dias_estimados_ate_critico} dias.`;
    }
    return "Crescendo, sem previsão exata de quando atinge o nível crítico.";
  }
  if (trecho.taxa_diaria < 0) {
    return "Em queda entre as duas leituras — vegetação foi cortada ou reduzida.";
  }
  return "Estável entre as duas leituras — sem variação de nível.";
}
