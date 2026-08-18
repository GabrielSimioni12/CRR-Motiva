import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const MARGEM_MM = 10;
const ESPACO_ENTRE_SECOES_MM = 6;

/**
 * Exporta uma lista de seções (uma por id de elemento do DOM) como PDF A4,
 * capturando cada seção como imagem separada e empilhando na página.
 *
 * Diferente de capturar o relatório inteiro como uma imagem única e
 * "fatiar" em páginas de altura fixa (abordagem anterior), aqui cada seção
 * é uma unidade indivisível: se não couber no espaço restante da página
 * atual, pula pra uma página nova inteira — nunca corta uma tabela ou um
 * bloco de cabeçalho no meio.
 */
export async function exportarRelatorioPdf(idsSecoes: string[], nomeArquivo: string) {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const larguraPagina = pdf.internal.pageSize.getWidth();
  const alturaPagina = pdf.internal.pageSize.getHeight();
  const larguraUtil = larguraPagina - MARGEM_MM * 2;
  const alturaUtilMaxima = alturaPagina - MARGEM_MM * 2;

  let cursorY = MARGEM_MM;
  let paginaTemConteudo = false;

  for (const id of idsSecoes) {
    const elemento = document.getElementById(id);
    if (!elemento) continue;

    const canvas = await html2canvas(elemento, {
      backgroundColor: "#1C1F22",
      scale: 2,
      useCORS: true,
    });

    let largura = larguraUtil;
    let altura = (canvas.height * largura) / canvas.width;

    // Seção maior que uma página inteira (ex: tabela muito grande): força
    // início de página nova e reduz pra caber na altura útil.
    if (altura > alturaUtilMaxima) {
      if (paginaTemConteudo) {
        pdf.addPage();
        cursorY = MARGEM_MM;
        paginaTemConteudo = false;
      }
      const fator = alturaUtilMaxima / altura;
      largura *= fator;
      altura = alturaUtilMaxima;
    } else if (paginaTemConteudo && cursorY + altura > alturaPagina - MARGEM_MM) {
      pdf.addPage();
      cursorY = MARGEM_MM;
      paginaTemConteudo = false;
    }

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", MARGEM_MM, cursorY, largura, altura);
    cursorY += altura + ESPACO_ENTRE_SECOES_MM;
    paginaTemConteudo = true;
  }

  pdf.save(nomeArquivo);
}
