import { initials, skillTone } from "@/lib/client/format";

export function SkillBadge({ name }: { name: string }) {
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-xs font-bold ${skillTone(name)}`}>
      {initials(name)}
    </span>
  );
}
