import { NextResponse } from "next/server";
import { buscarResumoClimatico } from "@/lib/clima";

export async function GET() {
  try {
    const resumo = await buscarResumoClimatico();
    return NextResponse.json(resumo);
  } catch (err) {
    console.error("Falha ao buscar dados da Open-Meteo:", err);
    return NextResponse.json(
      { error: "Não foi possível buscar o clima histórico agora." },
      { status: 502 }
    );
  }
}
