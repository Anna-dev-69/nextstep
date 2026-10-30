import { handle, json } from "@/lib/server/http";
import { reanalyzeVacancy } from "@/lib/server/vacancies";

export const maxDuration = 60;

type Context = { params: Promise<{ id: string }> };

export function POST(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await reanalyzeVacancy(id));
  });
}
