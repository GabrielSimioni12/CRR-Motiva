import { NextRequest, NextResponse } from "next/server";

const PROMPT = `Você é um assistente que ajuda equipes de manutenção rodoviária a
avaliar a vegetação às margens de rodovias a partir de uma foto.

Analise a imagem e estime a altura da vegetação/mato predominante, usando
como referência elementos comuns na cena (guard rail, meio-fio, placas,
pneus, pessoas, veículos) quando existirem.

Classifique em um dos 3 níveis abaixo (mesmo critério usado em inspeções
reais de rodovia):
  1 = h < 10 cm  (baixo, sem necessidade de corte)
  2 = 10 a 30 cm (atenção, agendar corte)
  3 = h > 30 cm  (crítico, cortar com urgência)

Além disso, identifique a área da imagem (em porcentagem, 0 a 100, origem
no canto superior esquerdo) onde está a vegetação predominante que você
usou para a estimativa. Essa área é usada só para desenhar uma marcação
visual sobre a foto, então uma aproximação razoável é suficiente.

Responda SOMENTE em JSON, neste formato exato, sem markdown e sem texto
antes ou depois:
{
  "nivel": 1 | 2 | 3,
  "altura_estimada_cm": number,
  "confianca": "baixa" | "media" | "alta",
  "justificativa": "string curta explicando o que na imagem levou a essa estimativa",
  "regiao_analisada": {
    "x": number,
    "y": number,
    "largura": number,
    "altura": number
  }
}

Se a imagem não mostrar vegetação de forma clara, responda com
"confianca": "baixa" e explique isso na justificativa.`;

function regiaoValida(
  r: unknown
): r is { x: number; y: number; largura: number; altura: number } {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    typeof o.largura === "number" &&
    typeof o.altura === "number"
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor (.env.local)" },
      { status: 500 }
    );
  }

  const { imageBase64, mediaType } = await req.json();
  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Imagem não enviada" }, { status: 400 });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mediaType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Erro da API Gemini: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    if (!regiaoValida(parsed.regiao_analisada)) {
      parsed.regiao_analisada = { x: 15, y: 25, largura: 70, altura: 55 };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: `Falha ao processar a resposta do modelo: ${String(err)}` },
      { status: 500 }
    );
  }
}