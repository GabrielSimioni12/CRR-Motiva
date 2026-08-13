export default function KmPost({ km, label }: { km: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-14 flex-col items-center justify-center border-2 border-chalk bg-asphalt-900">
        <span className="font-display text-xl font-bold leading-none text-chalk">
          {km}
        </span>
        <span className="mt-1 font-mono text-[9px] uppercase text-chalkdim">
          km
        </span>
      </div>
      <span className="mt-2 font-mono text-[10px] uppercase tracking-wide text-chalkdim">
        {label}
      </span>
    </div>
  );
}
