import { redirect } from "next/navigation";

// A tendência por trecho virou parte da sub-aba "Mapa & Tendência" do
// Dashboard unificado (/).
export default function TendenciaRedirect() {
  redirect("/?tab=mapa-tendencia");
}
