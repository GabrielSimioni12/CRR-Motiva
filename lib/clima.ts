// Coordenadas aproximadas da SP-021 (Rodoanel Oeste, região de Santana de Parnaíba/Barueri).
export const COORD_RODOVIA = { lat: -23.49, lon: -46.79 };

export interface ResumoClimatico {
  anoReferencia: number;
  precipMediaDiariaChuvosa: number; // mm/dia, média out–mar
  precipMediaDiariaSeca: number; // mm/dia, média abr–set
  precipMediaDiariaAnual: number; // mm/dia, média do ano inteiro
}

const MESES_CHUVOSOS = new Set([1, 2, 3, 10, 11, 12]); // out–mar
const MESES_SECOS = new Set([4, 5, 6, 7, 8, 9]); // abr–set

/**
 * Busca precipitação histórica diária do ano completo mais recente já
 * fechado, via Open-Meteo Archive API (sem necessidade de chave), e agrega
 * a média diária de chuva por estação. Usado só para calibrar o
 * multiplicador da simulação sazonal — se a API falhar, quem chama trata
 * o erro e cai de volta nos coeficientes fixos (ver lib/simulacao.ts).
 */
export async function buscarResumoClimatico(): Promise<ResumoClimatico> {
  const anoReferencia = new Date().getFullYear() - 1;
  const inicio = `${anoReferencia}-01-01`;
  const fim = `${anoReferencia}-12-31`;

  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(COORD_RODOVIA.lat));
  url.searchParams.set("longitude", String(COORD_RODOVIA.lon));
  url.searchParams.set("start_date", inicio);
  url.searchParams.set("end_date", fim);
  url.searchParams.set("daily", "precipitation_sum");
  url.searchParams.set("timezone", "America/Sao_Paulo");

  const resp = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!resp.ok) {
    throw new Error(`Open-Meteo respondeu ${resp.status}`);
  }

  const data = await resp.json();
  const datas: string[] = data?.daily?.time ?? [];
  const chuvas: number[] = data?.daily?.precipitation_sum ?? [];

  if (datas.length === 0 || datas.length !== chuvas.length) {
    throw new Error("Resposta da Open-Meteo sem dados diários de precipitação");
  }

  let somaChuvosa = 0;
  let diasChuvosa = 0;
  let somaSeca = 0;
  let diasSeca = 0;
  let somaAnual = 0;

  datas.forEach((data, i) => {
    const mes = Number(data.slice(5, 7));
    const valor = chuvas[i] ?? 0;
    somaAnual += valor;
    if (MESES_CHUVOSOS.has(mes)) {
      somaChuvosa += valor;
      diasChuvosa += 1;
    } else if (MESES_SECOS.has(mes)) {
      somaSeca += valor;
      diasSeca += 1;
    }
  });

  return {
    anoReferencia,
    precipMediaDiariaChuvosa: diasChuvosa > 0 ? somaChuvosa / diasChuvosa : 0,
    precipMediaDiariaSeca: diasSeca > 0 ? somaSeca / diasSeca : 0,
    precipMediaDiariaAnual: datas.length > 0 ? somaAnual / datas.length : 0,
  };
}
