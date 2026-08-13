"use client";

import { useState } from "react";
import PrioridadeBadge from "@/components/PrioridadeBadge";
import { Prioridade } from "@/lib/data";

interface ResultadoFoto {
  nivel: 1 | 2 | 3;
  altura_estimada_cm: number;
  confianca: "baixa" | "media" | "alta";
  justificativa: string;
}

const PRIORIDADE_POR_NIVEL: Record<number, Prioridade> = {
  1: "baixa",
  2: "media",
  3: "alta",
};

function fileParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

export default function ClassificarPorFotoPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoFoto | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleArquivo(file: File | null) {
    setResultado(null);
    setErro(null);
    setArquivo(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  async function classificar() {
    if (!arquivo) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const imageBase64 = await fileParaBase64(arquivo);
      const resp = await fetch("/api/classificar-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType: arquivo.type }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErro(data.error ?? "Erro ao classificar a imagem");
      } else {
        setResultado(data);
      }
    } catch (e) {
      setErro(String(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 inline-block border border-caution/50 bg-caution/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-caution">
        Protótipo — classificação por IA multimodal
      </div>

      <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-chalk">
        Classificar por foto
      </h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-chalkdim">
        Envie uma foto do trecho e um modelo de IA com visão estima a altura
        da vegetação e classifica no mesmo padrão usado nos dados reais da
        SP-021. É uma estimativa visual — não substitui uma medição
        calibrada, mas já valida a ideia sem precisar treinar um modelo do
        zero.
      </p>

      <div className="mt-8 border border-dashed border-asphalt-600 bg-asphalt-900 p-8 text-center">
        <input
          type="file"
          accept="image/*"
          id="foto-upload"
          className="hidden"
          onChange={(e) => handleArquivo(e.target.files?.[0] ?? null)}
        />
        <label
          htmlFor="foto-upload"
          className="cursor-pointer font-display text-sm uppercase tracking-wide text-chalkdim hover:text-caution"
        >
          Clique para selecionar uma foto
        </label>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Prévia da foto enviada"
            className="mx-auto mt-6 max-h-72 border border-asphalt-700"
          />
        )}

        {arquivo && (
          <button
            onClick={classificar}
            disabled={carregando}
            className="mt-6 border border-caution bg-caution px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-asphalt-900 hover:bg-caution/90 disabled:opacity-50"
          >
            {carregando ? "Classificando..." : "Classificar vegetação"}
          </button>
        )}
      </div>

      {erro && (
        <div className="mt-6 border border-route-alta/40 bg-route-alta/10 p-4 font-sans text-sm text-route-alta">
          {erro}
        </div>
      )}

      {resultado && (
        <div className="mt-6 border border-asphalt-700 bg-asphalt-800 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
                Resultado
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-chalk">
                ~{resultado.altura_estimada_cm} cm
                <span className="ml-3 text-base text-chalkdim">
                  nível {resultado.nivel}
                </span>
              </p>
            </div>
            <PrioridadeBadge prioridade={PRIORIDADE_POR_NIVEL[resultado.nivel]} />
          </div>
          <p className="mt-4 font-sans text-sm text-chalkdim">
            {resultado.justificativa}
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-chalkdim">
            confiança do modelo: {resultado.confianca}
          </p>
        </div>
      )}

      <p className="mt-10 border-t border-asphalt-700 pt-4 font-sans text-xs text-chalkdim">
        Essa estimativa vem de um modelo de linguagem com visão interpretando
        a imagem — não é uma medição calibrada por régua/sensor. Próximo
        passo, se quisermos mais precisão: coletar um dataset próprio de
        fotos com altura real medida, para treinar ou calibrar um modelo
        especializado.
      </p>
    </main>
  );
}
