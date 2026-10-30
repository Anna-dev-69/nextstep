import { ApiError } from "./http";
import { locatePlanItem } from "./plans";
import { type PlanView, viewPlan } from "./present";
import { createId, readOnly, timestamp, updateDatabase } from "./store";
import { PROJECT_STATUSES, type Database, type Project, type ProjectStatus } from "./types";
import {
  asRecord,
  optionalEnum,
  optionalIdList,
  optionalName,
  optionalNullableId,
  optionalText,
  requiredName,
} from "./validate";

export async function listProjects(): Promise<Project[]> {
  return readOnly((db) =>
    db.projects.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  );
}

export async function createProject(input: unknown): Promise<{
  project: Project;
  plan: PlanView | null;
}> {
  const body = asRecord(input);
  const title = requiredName(body, "title", 120);
  const description = optionalText(body, "description", 2000) ?? "";
  let skillIds = optionalIdList(body, "skillIds") ?? [];
  const planItemId = optionalNullableId(body, "planItemId") ?? null;
  const now = timestamp();

  return updateDatabase((db) => {
    let linkedPlan: PlanView | null = null;

    if (planItemId) {
      const located = locatePlanItem(db, planItemId);
      if (!located) throw new ApiError(404, "Пункт плана не найден.");
      if (skillIds.length === 0 && located.item.skillId) {
        skillIds = [located.item.skillId];
      }
      if (located.item.status === "todo") located.item.status = "in_progress";
      linkedPlan = viewPlan(located.plan);
    }

    assertSkillsExist(db, skillIds);

    const project: Project = {
      id: createId(),
      title,
      description,
      skillIds,
      planItemId,
      status: "planned",
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    db.projects.push(project);
    return { project, plan: linkedPlan };
  });
}

export async function getProject(id: string): Promise<Project> {
  return readOnly((db) => findProject(db, id));
}

export async function updateProject(
  id: string,
  input: unknown,
): Promise<{ project: Project; plan: PlanView | null }> {
  const body = asRecord(input);
  const title = optionalName(body, "title", 120);
  const description = optionalText(body, "description", 2000);
  const status = optionalEnum(body, "status", PROJECT_STATUSES);
  const skillIds = optionalIdList(body, "skillIds");
  const planItemId = optionalNullableId(body, "planItemId");

  if (
    title === undefined &&
    description === undefined &&
    status === undefined &&
    skillIds === undefined &&
    planItemId === undefined
  ) {
    throw new ApiError(400, "Нет полей для обновления.");
  }

  return updateDatabase((db) => {
    const project = findProject(db, id);
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (skillIds !== undefined) {
      assertSkillsExist(db, skillIds);
      project.skillIds = skillIds;
    }
    if (planItemId !== undefined) project.planItemId = planItemId;

    const now = timestamp();
    if (status !== undefined) applyStatus(project, status, now);
    project.updatedAt = now;

    const linked = project.planItemId ? locatePlanItem(db, project.planItemId) : null;
    if (planItemId && linked === null) {
      throw new ApiError(404, "Пункт плана не найден.");
    }
    if (linked && project.status === "done") linked.item.status = "done";
    if (linked && planItemId && linked.item.status === "todo") {
      linked.item.status = "in_progress";
    }

    return { project, plan: linked ? viewPlan(linked.plan) : null };
  });
}

export async function deleteProject(id: string): Promise<void> {
  await updateDatabase((db) => {
    findProject(db, id);
    db.projects = db.projects.filter((project) => project.id !== id);
  });
}

function applyStatus(project: Project, status: ProjectStatus, now: string): void {
  project.status = status;
  project.completedAt = status === "done" ? now : null;
}

function assertSkillsExist(db: Database, skillIds: string[]): void {
  const known = new Set(db.skills.map((skill) => skill.id));
  if (skillIds.some((skillId) => !known.has(skillId))) {
    throw new ApiError(400, "В skillIds есть неизвестный навык.");
  }
}

function findProject(db: Database, id: string): Project {
  const project = db.projects.find((item) => item.id === id);
  if (!project) throw new ApiError(404, "Проект не найден.");
  return project;
}
