import { handle, json, readJson } from "@/lib/server/http";
import { createProject, listProjects } from "@/lib/server/projects";

export function GET() {
  return handle(async () => json({ projects: await listProjects() }));
}

export function POST(request: Request) {
  return handle(async () => json(await createProject(await readJson(request)), 201));
}
