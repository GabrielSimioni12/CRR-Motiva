import { redirect } from "next/navigation";

// A simulação sazonal virou uma sub-aba do Dashboard unificado (/).
export default function SimulacaoRedirect() {
  redirect("/?tab=simulacao");
}
