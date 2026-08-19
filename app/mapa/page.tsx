import { redirect } from "next/navigation";

// O mapa virou uma sub-aba do Dashboard unificado (/).
export default function MapaRedirect() {
  redirect("/?tab=mapa-tendencia");
}
