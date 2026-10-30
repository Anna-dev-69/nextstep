import { ApiError } from "./http";
import {
  PLAN_LENGTHS,
  SKILL_LEVELS,
  type PlanLength,
  type SkillLevel,
} from "./types";

export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(400, "Ожидался JSON-объект.");
  }

  return value as Record<string, unknown>;
}

export function requiredName(
  body: Record<string, unknown>,
  field: string,
  max = 80,
): string {
  const value = body[field];
  if (typeof value !== "string") {
    throw new ApiError(400, `Поле ${field} должно быть строкой.`);
  }

  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > max) {
    throw new ApiError(400, `Поле ${field} должно быть от 1 до ${max} символов.`);
  }

  return name;
}

export function optionalName(
  body: Record<string, unknown>,
  field: string,
  max: number,
): string | undefined {
  if (!(field in body) || body[field] === undefined) return undefined;
  return requiredName(body, field, max);
}

export function optionalText(
  body: Record<string, unknown>,
  field: string,
  max: number,
): string | undefined {
  if (!(field in body) || body[field] === undefined || body[field] === null) {
    return undefined;
  }

  const value = body[field];
  if (typeof value !== "string") {
    throw new ApiError(400, `Поле ${field} должно быть строкой.`);
  }

  const text = value.trim();
  if (text.length > max) {
    throw new ApiError(400, `Поле ${field} должно быть не длиннее ${max} символов.`);
  }

  return text;
}

export function requiredVacancyText(body: Record<string, unknown>): string {
  const value = body.text;
  if (typeof value !== "string") {
    throw new ApiError(400, "Поле text должно быть строкой.");
  }

  const text = value.replace(/\r\n/g, "\n").trim();
  if (text.length < 40 || text.length > 20_000) {
    throw new ApiError(400, "Поле text должно быть от 40 до 20000 символов.");
  }

  return text;
}

export function requiredLevel(
  body: Record<string, unknown>,
  field = "level",
): SkillLevel {
  const value = body[field];
  if (!isSkillLevel(value)) {
    throw new ApiError(400, `Поле ${field} — целое число от 1 до 5.`);
  }

  return value;
}

export function optionalWeeks(body: Record<string, unknown>): PlanLength | undefined {
  if (!("weeks" in body) || body.weeks === undefined) return undefined;
  if (!isPlanLength(body.weeks)) {
    throw new ApiError(400, "Поле weeks должно быть 2, 3 или 4.");
  }

  return body.weeks;
}

export function requiredEnum<T extends string>(
  body: Record<string, unknown>,
  field: string,
  allowed: readonly T[],
): T {
  const value = body[field];
  if (typeof value !== "string" || !allowed.some((item) => item === value)) {
    throw new ApiError(
      400,
      `Поле ${field} должно быть одним из: ${allowed.join(", ")}.`,
    );
  }

  return value as T;
}

export function optionalEnum<T extends string>(
  body: Record<string, unknown>,
  field: string,
  allowed: readonly T[],
): T | undefined {
  if (!(field in body) || body[field] === undefined) return undefined;
  return requiredEnum(body, field, allowed);
}

export function optionalIdList(
  body: Record<string, unknown>,
  field: string,
): string[] | undefined {
  if (!(field in body) || body[field] === undefined) return undefined;

  const value = body[field];
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || item.trim() === "")
  ) {
    throw new ApiError(400, `Поле ${field} должно быть массивом непустых строк.`);
  }

  return [...new Set(value.map((item) => item.trim()))];
}

export function optionalNullableId(
  body: Record<string, unknown>,
  field: string,
): string | null | undefined {
  if (!(field in body) || body[field] === undefined) return undefined;
  if (body[field] === null) return null;

  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `Поле ${field} должно быть строкой или null.`);
  }

  return value.trim();
}

export function optionalNote(body: Record<string, unknown>): string | null {
  const note = optionalText(body, "note", 500);
  if (note === undefined || note.length === 0) return null;
  return note;
}

function isPlanLength(value: unknown): value is PlanLength {
  return typeof value === "number" && PLAN_LENGTHS.some((length) => length === value);
}

function isSkillLevel(value: unknown): value is SkillLevel {
  return (
    typeof value === "number" && SKILL_LEVELS.some((level) => level === value)
  );
}
