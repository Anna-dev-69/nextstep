import { handle, json, readJson } from "@/lib/server/http";
import { createVacancy, listVacancies } from "@/lib/server/vacancies";

export const maxDuration = 60;

export function GET() {
  return handle(async () => json({ vacancies: await listVacancies() }));
}

export function POST(request: Request) {
  return handle(async () => json(await createVacancy(await readJson(request)), 201));
}
