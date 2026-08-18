const EXEMPLOS = [
  {
    nivel: 1,
    titulo: "Baixo",
    faixa: "h < 10 cm",
    desc: "Grama aparada, rente ao chão. Mal cobre a sola de um sapato.",
    barraAltura: "h-4",
    corTexto: "text-route-ok",
    corBg: "bg-route-ok",
  },
  {
    nivel: 2,
    titulo: "Médio",
    faixa: "10–30 cm",
    desc: "Passa da altura do tornozelo, chega perto do joelho.",
    barraAltura: "h-10",
    corTexto: "text-route-media",
    corBg: "bg-route-media",
  },
  {
    nivel: 3,
    titulo: "Alto",
    faixa: "> 30 cm",
    desc: "Passa do joelho, dobra sozinha com o próprio peso.",
    barraAltura: "h-16",
    corTexto: "text-route-alta",
    corBg: "bg-route-alta",
  },
] as const;

export default function GuiaFoto() {
  return (
    <section className="mt-14 border-t border-asphalt-700 pt-10">
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk">
        Como tirar a foto
      </h2>
      <ul className="mt-4 space-y-2 font-sans text-sm text-chalkdim">
        <li>— Fotografe de pé, apontando a câmera para baixo, em direção ao mato.</li>
        <li>— Tente incluir algo de referência na cena (seu pé, uma trena, o meio-fio) — ajuda o modelo a estimar escala.</li>
        <li>— Evite fotos muito de longe ou contra a luz (sol atrás do mato).</li>
        <li>— Uma foto por vez, de um trecho só, é melhor que uma foto panorâmica de vários pontos.</li>
      </ul>

      <h3 className="mt-10 font-display text-sm font-semibold uppercase tracking-wide text-chalkdim">
        Referência de níveis
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {EXEMPLOS.map((ex) => (
          <div key={ex.nivel} className="border border-asphalt-700 bg-asphalt-800 p-4">
            <div className="flex h-16 items-end justify-center gap-1 border-b border-asphalt-700 pb-2">
              <div className={`w-3 ${ex.barraAltura} ${ex.corBg}`} />
              <div className={`w-3 ${ex.barraAltura} ${ex.corBg} opacity-70`} />
              <div className={`w-3 ${ex.barraAltura} ${ex.corBg} opacity-40`} />
            </div>
            <p className={`mt-3 font-display text-sm font-semibold uppercase tracking-wide ${ex.corTexto}`}>
              Nível {ex.nivel} — {ex.titulo}
            </p>
            <p className="font-mono text-xs text-chalkdim">{ex.faixa}</p>
            <p className="mt-2 font-sans text-xs text-chalkdim">{ex.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
