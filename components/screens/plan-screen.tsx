"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { IconCheck } from "@/components/icons";
import { LoadingBlock } from "@/components/loading-block";
import { PageHeader } from "@/components/page-header";
import { createProject, getPlan, getVacancy, listProjects, listVacancies, updatePlanItem, updateProject } from "@/lib/client/api";
import { cn, formatDate } from "@/lib/client/format";
import type { PlanItemView, PlanView } from "@/lib/server/present";
import type { PlanItemStatus, Project } from "@/lib/server/types";

export function PlanScreen({ planId }: { planId?: string }) {
  const [plan, setPlan] = useState<PlanView | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let id = planId ?? null;
        if (!id) {
          const vacancies = await listVacancies();
          for (const vacancy of vacancies.vacancies.slice(0, 8)) {
            const detail = await getVacancy(vacancy.id);
            if (detail.plans[0]) {
              id = detail.plans[0].id;
              break;
            }
          }
        }
        if (!id) {
          if (!cancelled) {
            setPlan(null);
            setLoading(false);
          }
          return;
        }
        const [nextPlan, projectData] = await Promise.all([getPlan(id), listProjects()]);
        if (cancelled) return;
        setPlan(nextPlan);
        setProjects(projectData.projects.filter((project) => nextPlan.items.some((item) => item.id === project.planItemId)));
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Не удалось загрузить план.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  async function changeStatus(item: PlanItemView, status: PlanItemStatus) {
    if (!plan) return;
    const previous = plan;
    setPlan({
      ...plan,
      items: plan.items.map((entry) => (entry.id === item.id ? { ...entry, status } : entry)),
    });
    setPendingId(item.id);
    setError(null);
    try {
      setPlan(await updatePlanItem(plan.id, item.id, status));
    } catch (reason) {
      setPlan(previous);
      setError(reason instanceof Error ? reason.message : "Не удалось обновить пункт.");
    } finally {
      setPendingId(null);
    }
  }

  async function saveProject(item: PlanItemView) {
    if (!plan) return;
    setPendingId(item.id);
    setError(null);
    try {
      const result = await createProject({
        title: item.skillName,
        description: item.projectIdea,
        planItemId: item.id,
      });
      setProjects((current) => [result.project, ...current]);
      if (result.plan) setPlan(result.plan);
      setNotice(`Проект «${item.skillName}» сохранён.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить проект.");
    } finally {
      setPendingId(null);
    }
  }

  async function finishProject(project: Project) {
    setPendingId(project.id);
    setError(null);
    try {
      const result = await updateProject(project.id, { status: "done" });
      setProjects((current) => current.map((item) => (item.id === project.id ? result.project : item)));
      if (result.plan) setPlan(result.plan);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось отметить проект.");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return <LoadingBlock />;
  if (error && !plan) return <p className="rounded-2xl bg-bad-bg px-4 py-3 text-sm text-bad">{error}</p>;
  if (!plan) {
    return (
      <div className="rounded-3xl bg-white px-5 py-10 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold">Плана пока нет</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">Он собирается из пробелов по вакансии. Сначала открой сравнение и выбери срок.</p>
        <Link href="/compare" className="mt-5 inline-flex h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white">
          К сравнению
        </Link>
      </div>
    );
  }

  const active = plan.items.filter((item) => item.status !== "done");
  const done = plan.items.filter((item) => item.status === "done");
  const weeks = [...new Set(plan.items.map((item) => item.week))];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${plan.weeks} недели`}
        title="План развития"
        text={plan.summary}
        action={
          <Link href={`/vacancies/${plan.vacancyId}`} className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-4 text-sm font-semibold">
            К сравнению
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {weeks.map((week) => (
          <span key={week} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted ring-1 ring-line">
            Неделя {week}
          </span>
        ))}
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted ring-1 ring-line">
          Готово {done.length} из {plan.items.length}
        </span>
      </div>

      {notice ? <p className="text-sm text-good" role="status">{notice}</p> : null}
      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <section className="space-y-3">
        {active.length === 0 ? <p className="rounded-3xl bg-white px-5 py-8 text-sm text-muted shadow-sm ring-1 ring-black/5">Все пункты этого плана отмечены.</p> : null}
        {active.map((item) => (
          <PlanRow
            key={item.id}
            item={item}
            busy={pendingId === item.id}
            hasProject={projects.some((project) => project.planItemId === item.id)}
            onToggle={() => changeStatus(item, "done")}
            onStart={() => changeStatus(item, item.status === "todo" ? "in_progress" : "done")}
            onSaveProject={() => saveProject(item)}
          />
        ))}
      </section>

      {done.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-muted">Завершено · {done.length}</h2>
          <ul className="mt-3 space-y-2">
            {done.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => changeStatus(item, "todo")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm text-muted ring-1 ring-black/5"
                >
                  <span className="grid size-6 place-items-center rounded-md bg-good text-white">
                    <IconCheck className="size-4" />
                  </span>
                  <span className="line-through">{item.skillName}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold">Проекты к этому плану</h2>
          <ul className="mt-3 space-y-3">
            {projects.map((project) => (
              <li key={project.id} className="flex flex-col gap-2 rounded-2xl bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{project.title}</p>
                  <p className="line-clamp-2 text-sm text-muted">{project.description}</p>
                </div>
                {project.status === "done" ? (
                  <span className="text-sm font-semibold text-good">Готово {project.completedAt ? formatDate(project.completedAt) : ""}</span>
                ) : (
                  <button
                    type="button"
                    disabled={pendingId === project.id}
                    onClick={() => finishProject(project)}
                    className="h-10 shrink-0 rounded-full bg-navy px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Отметить готовым
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs text-muted">План собран {formatDate(plan.createdAt)} и хранит уровни на тот момент.</p>
    </div>
  );
}

function PlanRow({
  item,
  busy,
  hasProject,
  onToggle,
  onStart,
  onSaveProject,
}: {
  item: PlanItemView;
  busy: boolean;
  hasProject: boolean;
  onToggle: () => void;
  onStart: () => void;
  onSaveProject: () => void;
}) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={item.status === "done" ? "Вернуть в план" : "Отметить готовым"}
          onClick={onToggle}
          disabled={busy}
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-line"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{item.skillName}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">{item.focus}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                <span className="font-medium text-accent">Проект. </span>
                {item.projectIdea}
              </p>
              <p className="mt-2 text-xs text-muted">
                Неделя {item.week}
                {item.importance === "preferred" ? " · будет плюсом" : " · обязательно"}
                {item.currentLevelLabel ? ` · было «${item.currentLevelLabel}»` : " · навыка не было"}
                {` · цель «${item.targetLevelLabel}»`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onStart}
                className={cn(
                  "h-10 rounded-full px-4 text-sm font-semibold text-white disabled:opacity-60",
                  item.status === "in_progress" ? "bg-good" : "bg-navy",
                )}
              >
                {item.status === "todo" ? "Начать" : "Готово"}
              </button>
              {hasProject ? (
                <span className="inline-flex h-10 items-center rounded-xl bg-canvas px-3 text-sm text-muted">Проект сохранён</span>
              ) : (
                <button type="button" disabled={busy} onClick={onSaveProject} className="h-10 rounded-xl border border-line px-3 text-sm font-semibold disabled:opacity-60">
                  Сохранить проект
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
