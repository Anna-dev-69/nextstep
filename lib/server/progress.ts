import {
  viewAssessment,
  viewSkill,
  type AssessmentView,
  type SkillView,
} from "./present";
import { readOnly } from "./store";
import type { Assessment, Skill } from "./types";

export type ProgressKind = "baseline" | "improved" | "declined" | "same";

export type SkillProgress = {
  skill: SkillView;
  assessmentsCount: number;
  kind: ProgressKind;
  first: AssessmentView;
  previous: AssessmentView | null;
  current: AssessmentView;
  deltaFromFirst: number;
  deltaFromPrevious: number;
};

export type ProgressReport = {
  skills: SkillProgress[];
  totals: {
    skills: number;
    baseline: number;
    improved: number;
    declined: number;
    same: number;
  };
};

export async function getProgress(): Promise<ProgressReport> {
  return readOnly((db) => {
    const skills = db.skills
      .map((skill) => toProgress(skill, db.assessments))
      .filter((item): item is SkillProgress => item !== null)
      .sort((left, right) =>
        right.current.assessedAt.localeCompare(left.current.assessedAt),
      );

    return {
      skills,
      totals: {
        skills: skills.length,
        baseline: skills.filter((item) => item.kind === "baseline").length,
        improved: skills.filter((item) => item.kind === "improved").length,
        declined: skills.filter((item) => item.kind === "declined").length,
        same: skills.filter((item) => item.kind === "same").length,
      },
    };
  });
}

function toProgress(skill: Skill, assessments: Assessment[]): SkillProgress | null {
  const history = assessments
    .filter((assessment) => assessment.skillId === skill.id)
    .slice()
    .sort((left, right) => left.assessedAt.localeCompare(right.assessedAt));

  const first = history[0];
  const current = history[history.length - 1];
  if (!first || !current) return null;

  const previous = history.length > 1 ? history[history.length - 2] : null;
  const deltaFromFirst = current.level - first.level;
  const deltaFromPrevious = previous ? current.level - previous.level : 0;

  return {
    skill: viewSkill(skill),
    assessmentsCount: history.length,
    kind: kindOf(previous, deltaFromPrevious),
    first: viewAssessment(first),
    previous: previous ? viewAssessment(previous) : null,
    current: viewAssessment(current),
    deltaFromFirst,
    deltaFromPrevious,
  };
}

function kindOf(previous: Assessment | null, deltaFromPrevious: number): ProgressKind {
  if (!previous) return "baseline";
  if (deltaFromPrevious > 0) return "improved";
  if (deltaFromPrevious < 0) return "declined";
  return "same";
}
