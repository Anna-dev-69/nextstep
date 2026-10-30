import { handle, json } from "@/lib/server/http";
import { getPlan } from "@/lib/server/plans";

type Context = { params: Promise<{ id: string }> };

export function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await getPlan(id));
  });
}
