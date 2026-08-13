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

Responda SOMENTE em JSON, neste formato exato, sem markdown e sem texto
antes ou depois:
{
  "nivel": 1 | 2 | 3,
  "altura_estimada_cm": number,
  "confianca": "baixa" | "media" | "alta",
  "justificativa": "string curta explicando o que na imagem levou a essa estimativa"
}

Se a imagem não mostrar vegetação de forma clara, responda com
"confianca": "baixa" e explique isso na justificativa.`;

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
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: `Falha ao processar a resposta do modelo: ${String(err)}` },
      { status: 500 }
    );
  }
}
