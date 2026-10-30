import { SKILL_LEVEL_LABEL, type Assessment, type LearningPlan, type PlanItem, type Requirement, type RequirementMatch, type Skill, type SkillLevel } from "./types";

export type SkillView = Skill & { levelLabel: string };

export type AssessmentView = Assessment & { levelLabel: string };

export type RequirementView = Requirement & { requiredLevelLabel: string };

export type MatchView = {
  requirement: RequirementView;
  skill: SkillView | null;
  status: RequirementMatch["status"];
  gap: number;
};

export type PlanItemView = PlanItem & {
  currentLevelLabel: string | null;
  targetLevelLabel: string;
};

export type PlanView = Omit<LearningPlan, "items"> & { items: PlanItemView[] };

export function viewSkill(skill: Skill): SkillView {
  return { ...skill, levelLabel: SKILL_LEVEL_LABEL[skill.level] };
}

export function viewAssessment(assessment: Assessment): AssessmentView {
  return { ...assessment, levelLabel: SKILL_LEVEL_LABEL[assessment.level] };
}

export function viewLevel(level: SkillLevel | null): string | null {
  if (level === null) return null;
  return SKILL_LEVEL_LABEL[level];
}

export function viewMatch(match: RequirementMatch): MatchView {
  return {
    requirement: {
      ...match.requirement,
      requiredLevelLabel: SKILL_LEVEL_LABEL[match.requirement.requiredLevel],
    },
    skill: match.skill ? viewSkill(match.skill) : null,
    status: match.status,
    gap: match.gap,
  };
}

export function viewPlan(plan: LearningPlan): PlanView {
  return {
    ...plan,
    items: plan.items.map((item) => ({
      ...item,
      currentLevelLabel: viewLevel(item.currentLevel),
      targetLevelLabel: SKILL_LEVEL_LABEL[item.targetLevel],
    })),
  };
}
