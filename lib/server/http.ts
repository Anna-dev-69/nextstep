export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, "Тело запроса должно быть JSON.");
  }
}

/** Маршрут отдаёт понятную ошибку клиенту, а неожиданный сбой пишет в лог сервера. */
export function handle(action: () => Promise<Response>): Promise<Response> {
  return action().catch((error: unknown) => {
    if (error instanceof ApiError) {
      return json({ error: error.message }, error.status);
    }

    console.error(error);
    return json({ error: "Внутренняя ошибка сервера." }, 500);
  });
}
