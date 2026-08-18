import { NextResponse } from "next/server";
import { buscarResumoClimatico } from "@/lib/clima";

export async function GET() {
  try {
    const resumo = await buscarResumoClimatico();
    return NextResponse.json(resumo);
  } catch (err) {
    return NextResponse.json(
      { error: `Falha ao buscar dados da Open-Meteo: ${String(err)}` },
      { status: 502 }
    );
  }
}
