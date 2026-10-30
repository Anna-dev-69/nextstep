import type { VacancyAnalysis } from "@/lib/server/vacancies";

let latest: VacancyAnalysis | null = null;

export function rememberAnalysis(analysis: VacancyAnalysis) {
  latest = analysis;
}

export function rememberedAnalysis(id: string) {
  return latest?.vacancy.id === id ? latest : null;
}
