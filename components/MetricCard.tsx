export default function MetricCard({
  label,
  value,
  unit,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "neutral" | "alta" | "media" | "ok";
}) {
  const toneColor = {
    neutral: "text-chalk",
    alta: "text-route-alta",
    media: "text-route-media",
    ok: "text-route-ok",
  }[tone];

  return (
    <div className="border border-asphalt-700 bg-asphalt-800 p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-chalkdim">
        {label}
      </p>
      <p className={`mt-2 font-display text-4xl font-semibold ${toneColor}`}>
        {value}
        {unit && <span className="ml-1 text-lg text-chalkdim">{unit}</span>}
      </p>
    </div>
  );
}
