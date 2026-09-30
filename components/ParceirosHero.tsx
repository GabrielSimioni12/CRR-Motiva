import Image from "next/image";

const PARCEIROS = [
  { nome: "FIAP", src: "/logos/fiap.png" },
  { nome: "Motiva", src: "/logos/motiva.png" },
];

export default function ParceirosHero() {
  return (
    <ul className="mt-3 flex items-center gap-3" aria-label="Instituições do projeto">
      {PARCEIROS.map((p) => (
        <li
          key={p.nome}
          title={p.nome}
          className="flex h-12 w-12 items-center justify-center rounded-md border border-asphalt-700 bg-chalk p-1.5"
        >
          <Image
            src={p.src}
            alt={`Logo ${p.nome}`}
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );
}