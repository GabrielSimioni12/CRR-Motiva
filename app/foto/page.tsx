import UploadClassificarFoto from "@/components/foto/UploadClassificarFoto";
import GuiaFoto from "@/components/foto/GuiaFoto";
import LeituraManualForm from "@/components/foto/LeituraManualForm";
import LeiturasRecentesFeed from "@/components/foto/LeiturasRecentesFeed";

export default function ClassificarPorFotoPage() {
  return (
    <main id="conteudo-principal" className="mx-auto max-w-4xl px-6 py-10">
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

      <UploadClassificarFoto />
      <GuiaFoto />
      <LeituraManualForm />
      <LeiturasRecentesFeed />
    </main>
  );
}
