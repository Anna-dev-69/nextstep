import type { MatchView } from "@/lib/server/present";

const tones = [
  "bg-[#eeedfe] text-[#6d5ef7]",
  "bg-[#e5f8f2] text-[#00b081]",
  "bg-[#fdecec] text-[#f14a4a]",
  "bg-[#fff1e0] text-[#f08c18]",
  "bg-[#eef0f6] text-[#1e2038]",
];

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function skillTone(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % tones.length;
  return tones[hash] ?? tones[0];
}

export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "?";
  const second = parts[1];
  if (!second) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}

export function matchPercent(matches: MatchView[]) {
  if (matches.length === 0) return 0;

  const score = matches.reduce((sum, match) => {
    if (match.status === "met") return sum + 1;
    if (match.status === "partial" && match.skill) {
      return sum + match.skill.level / match.requirement.requiredLevel;
    }
    return sum;
  }, 0);

  return Math.round((score / matches.length) * 100);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function countLabel(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

export function recommendation(matches: MatchView[]) {
  const gap =
    matches.find((match) => match.status !== "met" && match.requirement.importance === "required") ??
    matches.find((match) => match.status !== "met");

  if (!gap) {
    return "Текущие уровни закрывают разобранные темы. Можно закрепить их проектом из плана.";
  }

  const have = gap.skill
    ? `сейчас уровень «${gap.skill.levelLabel}»`
    : "в профиле этого навыка пока нет";

  return `Следующий шаг — «${gap.requirement.name}»: ${have}, для вакансии нужно «${gap.requirement.requiredLevelLabel}».`;
}
