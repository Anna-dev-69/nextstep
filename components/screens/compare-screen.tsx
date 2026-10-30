"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MountainPhoto } from "@/components/mountain";
import { PageHeader } from "@/components/page-header";
import { SkillBadge } from "@/components/skill-badge";
import { analyzeVacancy, createPlan, getVacancy, listVacancies } from "@/lib/client/api";
import { matchPercent, recommendation } from "@/lib/client/format";
import { rememberedAnalysis, rememberAnalysis } from "@/lib/client/latest-analysis";
import type { MatchView } from "@/lib/server/present";
import { PLAN_LENGTHS, type PlanLength } from "@/lib/server/types";
import type { VacancyAnalysis, VacancyListItem } from "@/lib/server/vacancies";

export function CompareScreen({ vacancyId }: { vacancyId?: string }) {
  const router = useRouter();
  const [vacancies, setVacancies] = useState<VacancyListItem[]>([]);
  const [analysis, setAnalysis] = useState<VacancyAnalysis | null>(null);
  const [weeks, setWeeks] = useState<PlanLength>(3);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const cached = vacancyId ? rememberedAnalysis(vacancyId) : null;
    setAnalysis(cached);
    setLoading(!cached);
    setError(null);

    async function load() {
      try {
        const list = vacancyId ? null : await listVacancies();
        const id = vacancyId ?? list?.vacancies[0]?.id;
        if (!id) {
          if (!cancelled) {
            setVacancies(list?.vacancies ?? []);
            setAnalysis(null);
          }
          return;
        }
        const detail = await getVacancy(id);
        if (cancelled) return;
        setAnalysis(detail);
        setLoading(false);
        const saved = list ?? await listVacancies();
        if (!cancelled) setVacancies(saved.vacancies);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Не удалось загрузить сравнение.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [vacancyId, attempt]);

  async function runModel() {
    if (!analysis) return;
    setReading(true);
    setError(null);
    try {
      const next = await analyzeVacancy(analysis.vacancy.id);
      rememberAnalysis(next);
      setAnalysis(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось разобрать вакансию.");
    } finally {
      setReading(false);
    }
  }

  async function buildPlan() {
    if (!analysis) return;
    setPending(true);
    setError(null);
    try {
      const plan = await createPlan(analysis.vacancy.id, weeks);
      router.push(`/plans/${plan.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось собрать план.");
    } finally {
      setPending(false);
    }
  }

  if (loading && !analysis) {
    return <p className="text-sm text-muted">Считаю совпадение с текущими навыками…</p>;
  }
  if (error && !analysis) {
    return (
      <div className="rounded-3xl bg-white px-5 py-8 shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-bad">{error}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white">
          Повторить
        </button>
      </div>
    );
  }
  if (!analysis) {
    return (
      <div className="rounded-3xl bg-white px-5 py-10 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold">Сравнивать пока не с чем</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">Сначала вставь текст вакансии. Сопоставление появится здесь.</p>
        <Link href="/analyze" className="mt-5 inline-flex h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white">
          К анализу вакансии
        </Link>
      </div>
    );
  }

  const percent = matchPercent(analysis.matches);
  const met = analysis.matches.filter((match) => match.status === "met");
  const gaps = analysis.matches.filter((match) => match.status !== "met");
  const latestPlan = analysis.plans[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={analysis.analyzed ? `${percent}% соответствия` : "Без разбора"}
        title={analysis.vacancy.title}
        text={
          analysis.analyzed
            ? "Темы ниже идут в порядке изучения: от фундамента к практике на этой должности."
            : "Эта вакансия сохранена до подключения модели."
        }
        action={
          vacancies.length > 1 ? (
            <label className="block text-sm text-muted">
              Вакансия
              <select
                value={analysis.vacancy.id}
                onChange={(event) => router.push(`/vacancies/${event.target.value}`)}
                className="mt-1 h-11 w-full rounded-2xl border border-line bg-white px-3 text-ink sm:w-64"
              >
                {vacancies.map((vacancy) => (
                  <option key={vacancy.id} value={vacancy.id}>
                    {vacancy.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null
        }
      />

      {analysis.analyzed ? (
        <>
          {analysis.overview ? (
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] sm:p-6">
              <p className="text-sm font-semibold text-accent">Как читать эту вакансию</p>
              <p className="mt-2 text-sm leading-6">{analysis.overview}</p>
              {analysis.model ? <p className="mt-3 text-xs text-muted">{analysis.model}</p> : null}
            </section>
          ) : null}
          <StudyList matches={analysis.matches} />
          <div className="grid gap-4 lg:grid-cols-2">
            <MatchColumn title="Совпадают" tone="good" matches={met} empty="Пока ни одна тема не закрыта полностью." />
            <MatchColumn title="Стоит изучить" tone="bad" matches={gaps} empty="Пробелов нет." />
          </div>
        </>
      ) : (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] sm:p-6">
          <p className="text-sm leading-6">Модель ещё не разбирала этот текст. После разбора здесь появится, что изучать и в каком порядке.</p>
          {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
          <button
            type="button"
            onClick={() => void runModel()}
            disabled={reading}
            className="mt-4 h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {reading ? "Модель читает вакансию…" : "Разобрать моделью"}
          </button>
        </section>
      )}

      {analysis.analyzed ? (
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative min-h-40">
            <MountainPhoto variant="hero" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute inset-x-4 bottom-4 text-sm font-semibold text-white">Твой карьерный рост</p>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-sm font-semibold text-accent">Рекомендация</p>
            <p className="mt-2 text-sm leading-6 text-ink">{recommendation(analysis.matches)}</p>
            {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {PLAN_LENGTHS.map((length) => (
                  <button
                    key={length}
                    type="button"
                    aria-pressed={weeks === length}
                    onClick={() => setWeeks(length)}
                    className={`h-10 rounded-full px-4 text-sm font-semibold ${weeks === length ? "bg-navy text-white" : "bg-canvas text-ink"}`}
                  >
                    {length} недели
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {latestPlan ? (
                  <Link href={`/plans/${latestPlan.id}`} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-navy">
                    Открыть план
                  </Link>
                ) : null}
                {gaps.length > 0 ? (
                  <button type="button" onClick={buildPlan} disabled={pending} className="h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60">
                    {pending ? "Собираю…" : "Перейти к плану развития"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
      ) : null}
    </div>
  );
}

function StudyList({ matches }: { matches: MatchView[] }) {
  if (matches.length === 0) {
    return <p className="text-sm text-muted">Модель не выделила тем. Попробуй разобрать вакансию ещё раз.</p>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Что изучать и в каком порядке</h2>
      <ol className="mt-3 space-y-3">
        {matches.map((match) => (
          <li
            key={`${match.requirement.order}-${match.requirement.name}`}
            className={`rounded-3xl bg-white p-4 shadow-sm ring-1 sm:p-5 ${match.status === "met" ? "ring-good/30" : "ring-black/[0.04]"}`}
          >
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-semibold text-white">
                {match.requirement.order}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="font-semibold">{match.requirement.name}</h3>
                  <p className="text-xs text-muted">{detail(match)}</p>
                </div>
                {match.requirement.why ? <p className="mt-2 text-sm leading-6">{match.requirement.why}</p> : null}
                {match.requirement.study ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                    <span className="font-medium text-ink">Изучить. </span>
                    {match.requirement.study}
                  </p>
                ) : null}
                {match.requirement.practice ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                    <span className="font-medium text-accent">Практика. </span>
                    {match.requirement.practice}
                  </p>
                ) : null}
                {match.requirement.evidence ? (
                  <p className="mt-2 text-xs leading-5 text-muted">«{match.requirement.evidence}»</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MatchColumn({
  title,
  tone,
  matches,
  empty,
}: {
  title: string;
  tone: "good" | "bad";
  matches: MatchView[];
  empty: string;
}) {
  const dot = tone === "good" ? "bg-good" : "bg-bad";
  const heading = tone === "good" ? "text-good" : "text-bad";

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
      <h2 className={`flex items-center gap-2 text-sm font-semibold ${heading}`}>
        <span className={`size-2 rounded-full ${dot}`} />
        {title} · {matches.length}
      </h2>
      {matches.length === 0 ? <p className="mt-4 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-3 space-y-2">
        {matches.map((match) => (
          <li key={`${match.requirement.name}-${match.requirement.importance}`} className="rounded-2xl bg-white px-3 py-3">
            <div className="flex items-center gap-3">
              <SkillBadge name={match.requirement.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{match.requirement.name}</p>
                <p className="truncate text-xs text-muted">{detail(match)}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold">
                {match.skill ? `${match.skill.level}/5` : "нет"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function detail(match: MatchView) {
  const importance = match.requirement.importance === "required" ? "обязательно" : "будет плюсом";
  if (match.status === "met") return `${importance} · ${match.skill?.levelLabel}`;
  if (match.status === "partial") {
    return `${importance} · сейчас ${match.skill?.levelLabel}, нужно ${match.requirement.requiredLevelLabel}`;
  }
  return `${importance} · нужно ${match.requirement.requiredLevelLabel}`;
}
