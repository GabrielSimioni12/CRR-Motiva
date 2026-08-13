import { TrechoPrioridade } from "@/lib/data";
import PrioridadeBadge from "./PrioridadeBadge";

export default function TabelaUrgentes({ trechos }: { trechos: TrechoPrioridade[] }) {
  return (
    <div className="overflow-x-auto border border-asphalt-700">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-asphalt-700 bg-asphalt-800 font-mono text-[11px] uppercase tracking-widest text-chalkdim">
            <th className="px-4 py-3">Trecho</th>
            <th className="px-4 py-3">Km</th>
            <th className="px-4 py-3">Nível 13/03</th>
            <th className="px-4 py-3">Nível 20/03</th>
            <th className="px-4 py-3">Previsão</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {trechos.map((t, i) => (
            <tr
              key={`${t.item_id}-${t.km}-${i}`}
              className="border-b border-asphalt-700/60 last:border-0 hover:bg-asphalt-800/60"
            >
              <td className="px-4 py-3 text-chalk">{t.descricao}</td>
              <td className="px-4 py-3 font-mono text-chalkdim">{t.km.toFixed(1)}</td>
              <td className="px-4 py-3 font-mono text-chalkdim">{t.nivel_semana1}</td>
              <td className="px-4 py-3 font-mono text-chalk">{t.nivel_semana2}</td>
              <td className="px-4 py-3 font-mono text-chalkdim">
                {t.dias_estimados_ate_critico === null
                  ? "—"
                  : t.dias_estimados_ate_critico === 0
                    ? "crítico"
                    : `${t.dias_estimados_ate_critico} dias`}
              </td>
              <td className="px-4 py-3">
                <PrioridadeBadge prioridade={t.prioridade} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
