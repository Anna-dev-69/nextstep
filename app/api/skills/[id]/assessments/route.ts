import { handle, json, readJson } from "@/lib/server/http";
import { addAssessment, listAssessments } from "@/lib/server/skills";

type Context = { params: Promise<{ id: string }> };

export function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json({ assessments: await listAssessments(id) });
  });
}

export function POST(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await addAssessment(id, await readJson(request)), 201);
  });
}
