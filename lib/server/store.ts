import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Database } from "./types";

const dataFile = path.join(process.cwd(), "data", "navigator.json");

let writeQueue: Promise<void> = Promise.resolve();

function emptyDatabase(): Database {
  return {
    version: 1,
    skills: [],
    assessments: [],
    vacancies: [],
    plans: [],
    projects: [],
  };
}

function isDatabase(value: unknown): value is Database {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    record.version === 1 &&
    Array.isArray(record.skills) &&
    Array.isArray(record.assessments) &&
    Array.isArray(record.vacancies) &&
    Array.isArray(record.plans) &&
    Array.isArray(record.projects)
  );
}

async function readDatabase(): Promise<Database> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isDatabase(parsed)) {
      throw new Error("Файл data/navigator.json имеет неожиданную форму.");
    }
    return parsed;
  } catch (error) {
    if (isMissingFile(error)) return emptyDatabase();
    throw error;
  }
}

async function writeDatabase(db: Database): Promise<void> {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(db, null, 2), "utf8");
}

/**
 * Читает файл, меняет объект в памяти и записывает его обратно.
 * Очередь не даёт двум запросам перезаписать изменения друг друга.
 * Если mutate бросает ошибку, файл не перезаписывается.
 */
export function updateDatabase<T>(mutate: (db: Database) => T): Promise<T> {
  const task = writeQueue.then(async () => {
    const db = await readDatabase();
    const result = mutate(db);
    await writeDatabase(db);
    return result;
  });

  writeQueue = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}

export function readOnly<T>(read: (db: Database) => T): Promise<T> {
  const task = writeQueue.then(async () => read(await readDatabase()));

  writeQueue = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}

export function createId(): string {
  return crypto.randomUUID();
}

export function timestamp(): string {
  return new Date().toISOString();
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
