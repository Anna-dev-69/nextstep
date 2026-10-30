import { cn } from "@/lib/client/format";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", light ? "text-white" : "text-navy")}>
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
        <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {compact ? null : <span className="text-lg">NextStep</span>}
    </span>
  );
}
