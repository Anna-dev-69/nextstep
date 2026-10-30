import { handle, json, noContent, readJson } from "@/lib/server/http";
import { deleteProject, getProject, updateProject } from "@/lib/server/projects";

type Context = { params: Promise<{ id: string }> };

export function GET(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await getProject(id));
  });
}

export function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    return json(await updateProject(id, await readJson(request)));
  });
}

export function DELETE(_request: Request, context: Context) {
  return handle(async () => {
    const { id } = await context.params;
    await deleteProject(id);
    return noContent();
  });
}
