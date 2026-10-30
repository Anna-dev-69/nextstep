import { handle, json, readJson } from "@/lib/server/http";
import { createSkill, listSkills } from "@/lib/server/skills";

export function GET() {
  return handle(async () => json({ skills: await listSkills() }));
}

export function POST(request: Request) {
  return handle(async () => json(await createSkill(await readJson(request)), 201));
}
