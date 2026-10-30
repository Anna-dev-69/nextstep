import { handle, json, readJson } from "@/lib/server/http";
import { createPlan } from "@/lib/server/plans";

type Context = { params: Promise<{ id: string }> };

export function POST(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await createPlan(id, await readJson(request)), 201);
  });
}
