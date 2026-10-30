"use client";

import { useState } from "react";

import { addAssessment, createSkill, deleteSkill, renameSkill } from "@/lib/client/api";
import { cn } from "@/lib/client/format";
import { SKILL_LEVEL_LABEL, SKILL_LEVELS, type SkillLevel } from "@/lib/server/types";
import type { SkillView } from "@/lib/server/present";

export function SkillDialog({
  skill,
  onClose,
  onSaved,
}: {
  skill: SkillView | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(skill?.name ?? "");
  const [level, setLevel] = useState<SkillLevel>(skill?.level ?? 3);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    const nextName = name.trim().replace(/\s+/g, " ");
    if (!nextName) {
      setError("Впиши название навыка.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      if (!skill) {
        await createSkill({ name: nextName, level });
      } else {
        if (nextName !== skill.name) await renameSkill(skill.id, nextName);
        if (level !== skill.level) await addAssessment(skill.id, { level });
      }
      onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить навык.");
      setPending(false);
    }
  }

  async function remove() {
    if (!skill) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await deleteSkill(skill.id);
      onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось удалить навык.");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-navy/40 p-4 sm:place-items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-dialog-title"
        className="max-h-[90vh] w-full max-w-md overflow-auto rounded-3xl bg-white p-5 shadow-xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="skill-dialog-title" className="text-xl font-semibold">
          {skill ? "Навык" : "Новый навык"}
        </h2>
        <p className="mt-1 text-sm text-muted">Уровень от 1 до 5 попадёт в профиль и в сравнение с вакансией.</p>

        <label className="mt-5 block text-sm font-medium">
          Название
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-line px-3 outline-none ring-accent/30 focus:ring-4"
            placeholder="Например, TypeScript"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Уровень: {SKILL_LEVEL_LABEL[level]}</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {SKILL_LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevel(item)}
                aria-pressed={level === item}
                className={cn(
                  "h-12 rounded-2xl border text-sm font-semibold",
                  level === item ? "border-navy bg-navy text-white" : "border-line bg-canvas text-ink",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {skill ? (
            <button type="button" onClick={remove} disabled={pending} className="h-11 rounded-2xl px-3 text-sm font-semibold text-bad disabled:opacity-60">
              {pending && confirmDelete ? "Удаляю…" : confirmDelete ? "Точно удалить" : "Удалить"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="h-11 flex-1 rounded-2xl border border-line px-4 text-sm font-semibold sm:flex-none">
              Отмена
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="h-11 flex-1 rounded-full bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60 sm:flex-none"
            >
              {pending && !confirmDelete ? "Сохраняю…" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
