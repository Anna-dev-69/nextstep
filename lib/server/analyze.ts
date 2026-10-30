import { projectIdeaFor, skillKey } from "./catalog";
import { SKILL_LEVEL_LABEL } from "./types";
import type {
  LearningPlan,
  MatchSummary,
  PlanItem,
  PlanLength,
  Requirement,
  RequirementMatch,
  Skill,
  SkillLevel,
} from "./types";

/** Сравнение с профилем и план. Текст вакансии разбирает модель в ai.ts. */
export function matchRequirements(
  requirements: Requirement[],
  skills: Skill[],
): RequirementMatch[] {
  return requirements.map((requirement) => {
    const skill = skillFor(requirement, skills);
    const gap = Math.max(0, requirement.requiredLevel - (skill?.level ?? 0));
    const status = skill === null ? "missing" : gap === 0 ? "met" : "partial";

    return { requirement, skill, status, gap };
  });
}

export function summarize(matches: RequirementMatch[]): MatchSummary {
  return {
    total: matches.length,
    required: matches.filter((match) => match.requirement.importance === "required").length,
    preferred: matches.filter((match) => match.requirement.importance === "preferred").length,
    met: matches.filter((match) => match.status === "met").length,
    partial: matches.filter((match) => match.status === "partial").length,
    missing: matches.filter((match) => match.status === "missing").length,
  };
}

export function resolveWeeks(gapCount: number, requested?: PlanLength): PlanLength {
  if (requested) return requested;
  if (gapCount <= 2) return 2;
  if (gapCount <= 4) return 3;
  return 4;
}

export function buildLearningPlan(input: {
  vacancyId: string;
  matches: RequirementMatch[];
  weeks?: PlanLength;
}): LearningPlan {
  const gaps = input.matches
    .filter((match) => match.status !== "met")
    .slice()
    .sort(compareStudyOrder);
  const weeks = resolveWeeks(gaps.length, input.weeks);
  const chosen = gaps.slice(0, weeks * 2);
  const items = chosen.map((match, index) => toPlanItem(match, index));
  const ordered = gaps.some((match) => match.requirement.order > 0);

  return {
    id: crypto.randomUUID(),
    vacancyId: input.vacancyId,
    weeks,
    summary: planSummary(weeks, items, gaps.length - chosen.length, input.matches.length > 0, ordered),
    omittedCount: gaps.length - chosen.length,
    createdAt: new Date().toISOString(),
    items,
  };
}

function skillFor(requirement: Requirement, skills: Skill[]): Skill | null {
  const byName = skills.find((skill) => skillKey(skill.name) === skillKey(requirement.name));
  if (byName) return byName;
  const linked = requirement.linkedSkillName;
  if (!linked) return null;
  return skills.find((skill) => skillKey(skill.name) === skillKey(linked)) ?? null;
}

function compareStudyOrder(left: RequirementMatch, right: RequirementMatch): number {
  if (
    left.requirement.order > 0 &&
    right.requirement.order > 0 &&
    left.requirement.order !== right.requirement.order
  ) {
    return left.requirement.order - right.requirement.order;
  }
  return compareGaps(left, right);
}

function compareGaps(left: RequirementMatch, right: RequirementMatch): number {
  const importance =
    Number(left.requirement.importance === "preferred") -
    Number(right.requirement.importance === "preferred");
  if (importance !== 0) return importance;

  const status = Number(left.status === "partial") - Number(right.status === "partial");
  if (status !== 0) return status;
  if (left.gap !== right.gap) return right.gap - left.gap;
  return left.requirement.name.localeCompare(right.requirement.name, "ru");
}

function toPlanItem(match: RequirementMatch, index: number): PlanItem {
  const currentLevel = match.skill?.level ?? null;
  const targetLevel = match.requirement.requiredLevel;
  const explanation = [match.requirement.why.trim(), match.requirement.study.trim()]
    .filter(Boolean)
    .join("\n");
  const practice = match.requirement.practice.trim();

  return {
    id: crypto.randomUUID(),
    week: Math.floor(index / 2) + 1,
    skillName: match.requirement.name,
    skillId: match.skill?.id ?? null,
    gap: match.status === "missing" ? "missing" : "partial",
    importance: match.requirement.importance,
    currentLevel,
    targetLevel,
    evidence: match.requirement.evidence,
    focus: explanation || focusFor(match.requirement.name, currentLevel, targetLevel),
    projectIdea: practice || projectIdeaFor(match.requirement.name),
    status: "todo",
  };
}

function focusFor(name: string, current: SkillLevel | null, target: SkillLevel): string {
  const next = Math.min(target, (current ?? 0) + 1) as SkillLevel;
  const targetLabel = SKILL_LEVEL_LABEL[target];
  const nextLabel = SKILL_LEVEL_LABEL[next];

  if (next === target) {
    if (current === null) {
      return `Дойти до уровня «${targetLabel}» в ${name} — этого достаточно для вакансии.`;
    }
    return `Поднять ${name} с «${SKILL_LEVEL_LABEL[current]}» до «${targetLabel}».`;
  }

  if (current === null) {
    return `Начать ${name} и дойти до «${nextLabel}». До требования вакансии («${targetLabel}») это ближайший шаг.`;
  }

  return `Поднять ${name} с «${SKILL_LEVEL_LABEL[current]}» до «${nextLabel}». Требование вакансии — «${targetLabel}», в этот срок берём ближайший шаг.`;
}

function planSummary(
  weeks: number,
  items: PlanItem[],
  omitted: number,
  hadRequirements: boolean,
  ordered: boolean,
): string {
  if (!hadRequirements) {
    return "Модель не выделила тем для изучения. Проверь текст вакансии и собери план ещё раз.";
  }

  if (items.length === 0) {
    return "Текущие уровни закрывают разобранные темы. Имеет смысл закрепить их отдельным проектом.";
  }

  const missing = items.filter((item) => item.gap === "missing").length;
  const partial = items.length - missing;
  const tail = omitted > 0 ? ` Вне этого срока осталось тем: ${omitted}.` : "";
  const order = ordered
    ? "Темы идут в порядке изучения: сначала то, без чего обязанности не выполнить."
    : "В неделе не больше двух, сначала обязательные пробелы.";

  return `Срок: ${weeks} недели. ${order} В плане тем: ${items.length} (нет совсем: ${missing}, нужно усилить: ${partial}).${tail}`;
}
