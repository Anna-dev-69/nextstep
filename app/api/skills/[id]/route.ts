import { handle, json, noContent, readJson } from "@/lib/server/http";
import { deleteSkill, getSkill, renameSkill } from "@/lib/server/skills";

type Context = { params: Promise<{ id: string }> };

export function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await getSkill(id));
  });
}

export function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await renameSkill(id, await readJson(request)));
  });
}

export function DELETE(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    await deleteSkill(id);
    return noContent();
  });
}
