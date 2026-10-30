import { handle, json } from "@/lib/server/http";
import { getProgress } from "@/lib/server/progress";

export function GET() {
  return handle(async () => json(await getProgress()));
}
