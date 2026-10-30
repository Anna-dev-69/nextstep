export const SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

/** 1 знакомство, 2 базовый, 3 уверенный, 4 продвинутый, 5 эксперт. */
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  1: "знакомство",
  2: "базовый",
  3: "уверенный",
  4: "продвинутый",
  5: "эксперт",
};

export const PLAN_LENGTHS = [2, 3, 4] as const;
export type PlanLength = (typeof PLAN_LENGTHS)[number];

export const PLAN_ITEM_STATUSES = ["todo", "in_progress", "done"] as const;
export type PlanItemStatus = (typeof PLAN_ITEM_STATUSES)[number];

export const PROJECT_STATUSES = ["planned", "in_progress", "done"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type Skill = {
  id: string;
  name: string;
  level: SkillLevel;
  createdAt: string;
  updatedAt: string;
};

/** Каждая запись — снимок уровня. Первая создаётся вместе с навыком. */
export type Assessment = {
  id: string;
  skillId: string;
  level: SkillLevel;
  note: string | null;
  assessedAt: string;
};

export type Vacancy = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  insight?: VacancyInsight;
};

export type RequirementImportance = "required" | "preferred";
export type RequirementSource = "ai";

/** Тема, которую модель выделила из вакансии. Совпадение с профилем считается заново. */
export type Requirement = {
  name: string;
  importance: RequirementImportance;
  requiredLevel: SkillLevel;
  evidence: string;
  source: RequirementSource;
  why: string;
  study: string;
  practice: string;
  order: number;
  linkedSkillName: string | null;
};

/** Снимок разбора. Повторное открытие вакансии не вызывает модель ещё раз. */
export type VacancyInsight = {
  overview: string;
  topics: Requirement[];
  provider: string;
  model: string;
  analyzedAt: string;
};

export type MatchStatus = "met" | "partial" | "missing";

export type RequirementMatch = {
  requirement: Requirement;
  skill: Skill | null;
  status: MatchStatus;
  gap: number;
};

export type MatchSummary = {
  total: number;
  required: number;
  preferred: number;
  met: number;
  partial: number;
  missing: number;
};

export type PlanItem = {
  id: string;
  week: number;
  skillName: string;
  skillId: string | null;
  gap: "missing" | "partial";
  importance: RequirementImportance;
  currentLevel: SkillLevel | null;
  targetLevel: SkillLevel;
  evidence: string;
  focus: string;
  projectIdea: string;
  status: PlanItemStatus;
};

/** План — снимок пробелов на момент генерации. Позже уровни могут измениться. */
export type LearningPlan = {
  id: string;
  vacancyId: string;
  weeks: PlanLength;
  summary: string;
  omittedCount: number;
  createdAt: string;
  items: PlanItem[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  skillIds: string[];
  planItemId: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type Database = {
  version: 1;
  skills: Skill[];
  assessments: Assessment[];
  vacancies: Vacancy[];
  plans: LearningPlan[];
  projects: Project[];
};
