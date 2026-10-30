"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { IconPencil, IconPlus, IconTrash } from "@/components/icons";
import { LevelBar } from "@/components/level-bar";
import { LoadingBlock } from "@/components/loading-block";
import { PageHeader } from "@/components/page-header";
import { SkillBadge } from "@/components/skill-badge";
import { SkillDialog } from "@/components/skill-dialog";
import { deleteSkill, listSkills } from "@/lib/client/api";
import { SKILL_LEVEL_LABEL, SKILL_LEVELS } from "@/lib/server/types";
import type { SkillView } from "@/lib/server/present";

export function SkillsScreen() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const [skills, setSkills] = useState<SkillView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogSkill, setDialogSkill] = useState<SkillView | null | undefined>(undefined);

  async function reload() {
    const data = await listSkills();
    setSkills(data.skills);
  }

  useEffect(() => {
    let cancelled = false;
    listSkills()
      .then((data) => {
        if (!cancelled) setSkills(data.skills);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Не удалось загрузить навыки.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = query
    ? skills.filter((skill) => skill.name.toLowerCase().includes(query.toLowerCase()))
    : skills;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Мои навыки"
        text="Добавляй, оценивай и обновляй уровень. Шкала от 1 до 5."
        action={
          <button
            type="button"
            onClick={() => setDialogSkill(null)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white"
          >
            <IconPlus className="size-4" />
            <span className="sm:hidden">Добавить</span>
            <span className="hidden sm:inline">Добавить навык</span>
          </button>
        }
      />

      <ul className="flex flex-wrap gap-2">
        {SKILL_LEVELS.map((level) => (
          <li key={level} className="rounded-full bg-white px-3 py-1 text-xs text-muted ring-1 ring-line">
            {level} · {SKILL_LEVEL_LABEL[level]}
          </li>
        ))}
      </ul>

      {query ? <p className="text-sm text-muted">Фильтр: {query}</p> : null}
      {error ? <p className="rounded-2xl bg-bad-bg px-4 py-3 text-sm text-bad">{error}</p> : null}
      {loading ? <LoadingBlock /> : null}

      {!loading && visible.length === 0 ? (
        <div className="rounded-3xl bg-white px-5 py-10 text-center shadow-sm ring-1 ring-black/5">
          <p className="font-medium">{skills.length === 0 ? "Навыков пока нет" : "По этому фильтру пусто"}</p>
          <p className="mt-2 text-sm text-muted">Название лучше писать так, как оно встречается в вакансиях.</p>
        </div>
      ) : null}

      {visible.length > 0 ? (
        <ul className="space-y-3">
          {visible.map((skill) => (
            <li key={skill.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
              <div className="flex items-start gap-3">
                <SkillBadge name={skill.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{skill.name}</p>
                      <p className="text-sm text-muted">{skill.levelLabel}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-sm font-semibold text-accent">{skill.level}/5</span>
                      <IconButton label="Изменить" onClick={() => setDialogSkill(skill)}>
                        <IconPencil className="size-4" />
                      </IconButton>
                      <IconButton
                        label="Удалить"
                        onClick={async () => {
                          if (!window.confirm(`Удалить навык «${skill.name}»?`)) return;
                          try {
                            await deleteSkill(skill.id);
                            await reload();
                          } catch (reason) {
                            setError(reason instanceof Error ? reason.message : "Не удалось удалить навык.");
                          }
                        }}
                      >
                        <IconTrash className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="mt-3">
                    <LevelBar level={skill.level} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {dialogSkill !== undefined ? (
        <SkillDialog
          skill={dialogSkill}
          onClose={() => setDialogSkill(undefined)}
          onSaved={() => {
            void reload().catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Не удалось обновить список.");
            });
          }}
        />
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink"
    >
      {children}
    </button>
  );
}
