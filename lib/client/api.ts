import type { PlanView, SkillView } from "@/lib/server/present";
import type { ProgressReport } from "@/lib/server/progress";
import type { PlanItemStatus, PlanLength, Project, SkillLevel } from "@/lib/server/types";
import type { VacancyAnalysis, VacancyListItem } from "@/lib/server/vacancies";

async function request<T>(path: string, init?: RequestInit, timeoutMs = 12000): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
      headers: {
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error("Сервер не ответил. Проверь, что приложение запущено, и попробуй ещё раз.");
    }
    throw new Error("Не удалось связаться с сервером.");
  }

  const text = await response.text();
  let data: { error?: string } | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as { error?: string };
    } catch {
      throw new Error("Сервер ответил не тем форматом. Обнови страницу.");
    }
  }

  if (!response.ok) {
    throw new Error(data?.error ?? "Не удалось выполнить запрос.");
  }

  return data as T;
}

export function listSkills() {
  return request<{ skills: SkillView[] }>("/api/skills");
}

export function createSkill(input: { name: string; level: SkillLevel }) {
  return request<{ skill: SkillView }>("/api/skills", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function renameSkill(id: string, name: string) {
  return request<SkillView>(`/api/skills/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteSkill(id: string) {
  return request<null>(`/api/skills/${id}`, { method: "DELETE" });
}

export function addAssessment(id: string, input: { level: SkillLevel; note?: string }) {
  return request<{ skill: SkillView; delta: number }>(`/api/skills/${id}/assessments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listVacancies() {
  return request<{ vacancies: VacancyListItem[] }>("/api/vacancies");
}

export function createVacancy(input: { title?: string; text: string }) {
  return request<VacancyAnalysis>(
    "/api/vacancies",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    70_000,
  );
}

export function analyzeVacancy(id: string) {
  return request<VacancyAnalysis>(`/api/vacancies/${id}/analyze`, { method: "POST" }, 70_000);
}

export function getVacancy(id: string) {
  return request<VacancyAnalysis>(`/api/vacancies/${id}`);
}

export function createPlan(vacancyId: string, weeks?: PlanLength) {
  return request<PlanView>(`/api/vacancies/${vacancyId}/plan`, {
    method: "POST",
    body: JSON.stringify(weeks ? { weeks } : {}),
  });
}

export function getPlan(id: string) {
  return request<PlanView>(`/api/plans/${id}`);
}

export function updatePlanItem(planId: string, itemId: string, status: PlanItemStatus) {
  return request<PlanView>(`/api/plans/${planId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function listProjects() {
  return request<{ projects: Project[] }>("/api/projects");
}

export function createProject(input: {
  title: string;
  description: string;
  planItemId: string;
}) {
  return request<{ project: Project; plan: PlanView | null }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProject(id: string, input: { status: Project["status"] }) {
  return request<{ project: Project; plan: PlanView | null }>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getProgress() {
  return request<ProgressReport>("/api/progress");
}
