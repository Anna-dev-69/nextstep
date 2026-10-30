import { handle, json, readJson } from "@/lib/server/http";
import { updatePlanItem } from "@/lib/server/plans";

type Context = { params: Promise<{ id: string; itemId: string }> };

export function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const { id, itemId } = await context.params;
    return json(await updatePlanItem(id, itemId, await readJson(request)));
  });
}
