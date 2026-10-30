import { buildLearningPlan, matchRequirements } from "./analyze";
import { ApiError } from "./http";
import { viewPlan, type PlanView } from "./present";
import { readOnly, updateDatabase } from "./store";
import { PLAN_ITEM_STATUSES, type Database, type LearningPlan, type PlanItem } from "./types";
import { asRecord, optionalWeeks, requiredEnum } from "./validate";

export async function createPlan(vacancyId: string, input: unknown): Promise<PlanView> {
  const weeks = optionalWeeks(asRecord(input));

  return updateDatabase((db) => {
    const vacancy = db.vacancies.find((item) => item.id === vacancyId);
    if (!vacancy) throw new ApiError(404, "Вакансия не найдена.");
    if (!vacancy.insight) throw new ApiError(409, "Сначала разбери вакансию моделью.");

    const matches = matchRequirements(vacancy.insight.topics, db.skills);
    const plan = buildLearningPlan({ vacancyId, matches, weeks });
    db.plans.push(plan);
    return viewPlan(plan);
  });
}

export async function getPlan(id: string): Promise<PlanView> {
  return readOnly((db) => viewPlan(findPlan(db, id)));
}

export async function updatePlanItem(
  planId: string,
  itemId: string,
  input: unknown,
): Promise<PlanView> {
  const status = requiredEnum(asRecord(input), "status", PLAN_ITEM_STATUSES);

  return updateDatabase((db) => {
    const plan = findPlan(db, planId);
    const item = plan.items.find((entry) => entry.id === itemId);
    if (!item) throw new ApiError(404, "Пункт плана не найден.");
    item.status = status;
    return viewPlan(plan);
  });
}

export function locatePlanItem(
  db: Database,
  itemId: string,
): { plan: LearningPlan; item: PlanItem } | null {
  for (const plan of db.plans) {
    const item = plan.items.find((entry) => entry.id === itemId);
    if (item) return { plan, item };
  }
  return null;
}

function findPlan(db: Database, id: string): LearningPlan {
  const plan = db.plans.find((item) => item.id === id);
  if (!plan) throw new ApiError(404, "План не найден.");
  return plan;
}
