import { skillKey } from "./catalog";
import { ApiError } from "./http";
import { viewAssessment, viewSkill, type AssessmentView, type SkillView } from "./present";
import { createId, timestamp, updateDatabase, readOnly } from "./store";
import { SKILL_LEVEL_LABEL, type Assessment, type Database, type Skill } from "./types";
import { asRecord, optionalNote, requiredLevel, requiredName } from "./validate";

export async function listSkills(): Promise<SkillView[]> {
  return readOnly((db) =>
    db.skills
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name, "ru"))
      .map(viewSkill),
  );
}

export async function createSkill(input: unknown): Promise<{
  skill: SkillView;
  assessment: AssessmentView;
}> {
  const body = asRecord(input);
  const name = requiredName(body, "name");
  const level = requiredLevel(body);
  const now = timestamp();

  return updateDatabase((db) => {
    assertUniqueName(db, name);

    const skill: Skill = {
      id: createId(),
      name,
      level,
      createdAt: now,
      updatedAt: now,
    };
    const assessment: Assessment = {
      id: createId(),
      skillId: skill.id,
      level,
      note: null,
      assessedAt: now,
    };

    db.skills.push(skill);
    db.assessments.push(assessment);

    return { skill: viewSkill(skill), assessment: viewAssessment(assessment) };
  });
}

export async function getSkill(id: string): Promise<{
  skill: SkillView;
  assessments: AssessmentView[];
}> {
  return readOnly((db) => {
    const skill = findSkill(db, id);
    return {
      skill: viewSkill(skill),
      assessments: history(db, id).map(viewAssessment),
    };
  });
}

export async function renameSkill(id: string, input: unknown): Promise<SkillView> {
  const body = asRecord(input);
  if ("level" in body) {
    throw new ApiError(
      400,
      "Уровень меняется через POST /api/skills/:id/assessments, чтобы сохранилась история.",
    );
  }

  const name = requiredName(body, "name");

  return updateDatabase((db) => {
    const skill = findSkill(db, id);
    assertUniqueName(db, name, id);
    skill.name = name;
    skill.updatedAt = timestamp();
    return viewSkill(skill);
  });
}

export async function deleteSkill(id: string): Promise<void> {
  await updateDatabase((db) => {
    findSkill(db, id);
    db.skills = db.skills.filter((skill) => skill.id !== id);
    db.assessments = db.assessments.filter((assessment) => assessment.skillId !== id);

    for (const project of db.projects) {
      const nextIds = project.skillIds.filter((skillId) => skillId !== id);
      if (nextIds.length !== project.skillIds.length) {
        project.skillIds = nextIds;
        project.updatedAt = timestamp();
      }
    }

    for (const plan of db.plans) {
      for (const item of plan.items) {
        if (item.skillId === id) item.skillId = null;
      }
    }
  });
}

export async function listAssessments(skillId: string): Promise<AssessmentView[]> {
  return readOnly((db) => {
    findSkill(db, skillId);
    return history(db, skillId).map(viewAssessment);
  });
}

export async function addAssessment(
  skillId: string,
  input: unknown,
): Promise<{
  skill: SkillView;
  assessment: AssessmentView;
  previousLevel: Skill["level"] | null;
  previousLevelLabel: string | null;
  delta: number;
}> {
  const body = asRecord(input);
  const level = requiredLevel(body);
  const note = optionalNote(body);

  return updateDatabase((db) => {
    const skill = findSkill(db, skillId);
    const previousLevel = skill.level;
    const now = timestamp();
    const assessment: Assessment = {
      id: createId(),
      skillId,
      level,
      note,
      assessedAt: now,
    };

    skill.level = level;
    skill.updatedAt = now;
    db.assessments.push(assessment);

    return {
      skill: viewSkill(skill),
      assessment: viewAssessment(assessment),
      previousLevel,
      previousLevelLabel: SKILL_LEVEL_LABEL[previousLevel],
      delta: level - previousLevel,
    };
  });
}

function findSkill(db: Database, id: string): Skill {
  const skill = db.skills.find((item) => item.id === id);
  if (!skill) throw new ApiError(404, "Навык не найден.");
  return skill;
}

function history(db: Database, skillId: string): Assessment[] {
  return db.assessments
    .filter((assessment) => assessment.skillId === skillId)
    .slice()
    .sort((left, right) => left.assessedAt.localeCompare(right.assessedAt));
}

function assertUniqueName(db: Database, name: string, exceptId?: string): void {
  const key = skillKey(name);
  const existing = db.skills.find(
    (skill) => skill.id !== exceptId && skillKey(skill.name) === key,
  );

  if (existing) {
    throw new ApiError(
      409,
      `Навык «${existing.name}» уже есть. Новый уровень записывается оценкой, а не вторым навыком.`,
    );
  }
}
