export default function ZonaDiagrama({ descricao }: { descricao: string }) {
  const d = descricao.toUpperCase();
  const central = d.includes("CENTRAL");
  const lateral = d.includes("LATERAL");
  const marginalOuDispositivo = d.includes("MARGINAL") || d.includes("DISPOSITIVO");

  const segCor = (ativo: boolean) => (ativo ? "bg-caution" : "bg-asphalt-600");

  return (
    <div
      className="flex h-3 w-16 shrink-0 overflow-hidden rounded-sm"
      title="Posição aproximada na seção da via (diagrama ilustrativo)"
    >
      <span className={`flex-1 ${segCor(marginalOuDispositivo)}`} />
      <span className={`flex-1 ${segCor(lateral)}`} />
      <span className={`flex-[1.4] ${segCor(central)}`} />
      <span className={`flex-1 ${segCor(lateral)}`} />
      <span className={`flex-1 ${segCor(marginalOuDispositivo)}`} />
    </div>
  );
}