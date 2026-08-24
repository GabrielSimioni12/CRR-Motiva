export default function GramaIlustracao({ nivel }: { nivel: 1 | 2 | 3 }) {
  const alturaBase = nivel === 1 ? 10 : nivel === 2 ? 20 : 32;
  const baseY = 44;
  const laminas = [
    { x: 4, h: alturaBase * 0.7, curva: -6 },
    { x: 13, h: alturaBase, curva: 2 },
    { x: 22, h: alturaBase * 0.85, curva: -3 },
    { x: 30, h: alturaBase * 0.9, curva: 5 },
  ];

  return (
    <svg width="40" height="48" viewBox="0 0 40 48" className="overflow-visible">
      <line x1="0" y1={baseY} x2="38" y2={baseY} stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {laminas.map((l, i) => (
        <path
          key={i}
          d={`M ${l.x} ${baseY} Q ${l.x + 2} ${baseY - l.h / 2} ${l.x + l.curva} ${baseY - l.h}`}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}