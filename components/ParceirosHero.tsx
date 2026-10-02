import Image from "next/image";

const PARCEIROS = [
  { nome: "FIAP", src: "/logos/fiap.png" },
  { nome: "Motiva", src: "/logos/motiva.png" },
];

export default function ParceirosHero() {
  return (
    <ul className="mt-3 flex items-center gap-4" aria-label="Instituições do projeto">
      {PARCEIROS.map((p) => (
        <li key={p.nome} title={p.nome}>
          <Image
            src={p.src}
            alt={`Logo ${p.nome}`}
            width={80}
            height={80}
            className="h-10 w-10 rounded-md object-contain"
          />
        </li>
      ))}
    </ul>
  );
}