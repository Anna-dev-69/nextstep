export function LevelBar({ level, label }: { level: number; label?: string }) {
  return (
    <div className="min-w-0">
      <div className="h-2 overflow-hidden rounded-full bg-navy/10">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.max(0, Math.min(5, level)) / 5 * 100}%` }}
        />
      </div>
      {label ? <p className="mt-1 text-xs text-muted">{label}</p> : null}
    </div>
  );
}
