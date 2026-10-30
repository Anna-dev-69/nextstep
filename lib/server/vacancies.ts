import { interpretVacancy } from "./ai";
import { matchRequirements, summarize } from "./analyze";
import { ApiError } from "./http";
import { viewMatch, type MatchView } from "./present";
import { createId, readOnly, timestamp, updateDatabase } from "./store";
import type { Database, MatchSummary, Vacancy } from "./types";
import { asRecord, optionalName, requiredVacancyText } from "./validate";

export type PlanDigest = {
  id: string;
  weeks: number;
  createdAt: string;
  itemCount: number;
  doneCount: number;
};

export type VacancyListItem = {
  id: string;
  title: string;
  createdAt: string;
  excerpt: string;
  requirementCount: number;
};

export type VacancyAnalysis = {
  vacancy: Vacancy;
  matches: MatchView[];
  summary: MatchSummary;
  plans: PlanDigest[];
  analyzed: boolean;
  overview: string | null;
  model: string | null;
};

export async function listVacancies(): Promise<VacancyListItem[]> {
  return readOnly((db) =>
    db.vacancies
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((vacancy) => ({
        id: vacancy.id,
        title: vacancy.title,
        createdAt: vacancy.createdAt,
        excerpt: excerpt(vacancy.text),
        requirementCount: vacancy.insight?.topics.length ?? 0,
      })),
  );
}

export async function createVacancy(input: unknown): Promise<VacancyAnalysis> {
  const body = asRecord(input);
  const text = requiredVacancyText(body);
  const title = optionalName(body, "title", 120) ?? titleFromText(text);
  const skills = await readOnly((db) => db.skills);
  const insight = await interpretVacancy({ title, text, skills });

  return updateDatabase((db) => {
    const vacancy: Vacancy = {
      id: createId(),
      title,
      text,
      createdAt: timestamp(),
      insight,
    };
    db.vacancies.push(vacancy);
    return analyze(db, vacancy);
  });
}

export async function reanalyzeVacancy(id: string): Promise<VacancyAnalysis> {
  const current = await readOnly((db) => {
    const vacancy = findVacancy(db, id);
    return { title: vacancy.title, text: vacancy.text, skills: db.skills };
  });
  const insight = await interpretVacancy(current);

  return updateDatabase((db) => {
    const vacancy = findVacancy(db, id);
    vacancy.insight = insight;
    return analyze(db, vacancy);
  });
}

export async function getVacancy(id: string): Promise<VacancyAnalysis> {
  return readOnly((db) => analyze(db, findVacancy(db, id)));
}

export async function deleteVacancy(id: string): Promise<void> {
  await updateDatabase((db) => {
    findVacancy(db, id);
    const removedItems = new Set(
      db.plans
        .filter((plan) => plan.vacancyId === id)
        .flatMap((plan) => plan.items.map((item) => item.id)),
    );

    db.vacancies = db.vacancies.filter((vacancy) => vacancy.id !== id);
    db.plans = db.plans.filter((plan) => plan.vacancyId !== id);

    for (const project of db.projects) {
      if (project.planItemId && removedItems.has(project.planItemId)) {
        project.planItemId = null;
        project.updatedAt = timestamp();
      }
    }
  });
}

function analyze(db: Database, vacancy: Vacancy): VacancyAnalysis {
  const matches = matchRequirements(vacancy.insight?.topics ?? [], db.skills).sort((left, right) => {
    const order = left.requirement.order - right.requirement.order;
    if (order !== 0) return order;
    return left.requirement.name.localeCompare(right.requirement.name, "ru");
  });

  const plans = db.plans
    .filter((plan) => plan.vacancyId === vacancy.id)
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((plan) => ({
      id: plan.id,
      weeks: plan.weeks,
      createdAt: plan.createdAt,
      itemCount: plan.items.length,
      doneCount: plan.items.filter((item) => item.status === "done").length,
    }));

  return {
    vacancy,
    matches: matches.map(viewMatch),
    summary: summarize(matches),
    plans,
    analyzed: vacancy.insight != null,
    overview: vacancy.insight?.overview ?? null,
    model: vacancy.insight ? `${vacancy.insight.provider} · ${vacancy.insight.model}` : null,
  };
}

function findVacancy(db: Database, id: string): Vacancy {
  const vacancy = db.vacancies.find((item) => item.id === id);
  if (!vacancy) throw new ApiError(404, "Вакансия не найдена.");
  return vacancy;
}

function titleFromText(text: string): string {
  const line = text
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.length > 0);

  if (!line) return "Вакансия";
  return line.replace(/^#{1,6}\s*/, "").replace(/\s+/g, " ").slice(0, 80);
}

function excerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= 160) return flat;
  return `${flat.slice(0, 157)}...`;
}
