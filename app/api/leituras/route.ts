import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { local, km, alturaCm, nivel, fonte, confianca, justificativa } = body;

    if (!local || typeof alturaCm !== "number" || typeof nivel !== "number" || !fonte) {
      return NextResponse.json(
        { error: "Campos obrigatórios: local, alturaCm, nivel, fonte" },
        { status: 400 }
      );
    }
    if (![1, 2, 3].includes(nivel)) {
      return NextResponse.json({ error: "nivel deve ser 1, 2 ou 3" }, { status: 400 });
    }
    if (!["foto", "manual"].includes(fonte)) {
      return NextResponse.json({ error: "fonte deve ser 'foto' ou 'manual'" }, { status: 400 });
    }

    const pool = getPool();
    const resultado = await pool.query(
      `INSERT INTO leituras (local, km, altura_cm, nivel, fonte, confianca, justificativa)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, local, km, altura_cm, nivel, fonte, confianca, justificativa, criado_em`,
      [local, km ?? null, alturaCm, nivel, fonte, confianca ?? null, justificativa ?? null]
    );

    return NextResponse.json(resultado.rows[0], { status: 201 });
  } catch (err) {
    console.error("Erro ao salvar leitura:", err);
    return NextResponse.json(
      { error: `Falha ao salvar no banco: ${String(err)}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pool = getPool();
    const resultado = await pool.query(
      `SELECT id, local, km, altura_cm, nivel, fonte, confianca, justificativa, criado_em
       FROM leituras
       ORDER BY criado_em DESC
       LIMIT 200`
    );
    return NextResponse.json(resultado.rows);
  } catch (err) {
    console.error("Erro ao listar leituras:", err);
    return NextResponse.json(
      { error: `Falha ao consultar o banco: ${String(err)}` },
      { status: 500 }
    );
  }
}