import { handle, json, noContent } from "@/lib/server/http";
import { deleteVacancy, getVacancy } from "@/lib/server/vacancies";

type Context = { params: Promise<{ id: string }> };

export function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await getVacancy(id));
  });
}

export function DELETE(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    await deleteVacancy(id);
    return noContent();
  });
}
