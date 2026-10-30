"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";

import { IconAnalyze, IconFlag, IconPlan, IconSkills } from "@/components/icons";
import { LoadingBlock } from "@/components/loading-block";
import { MountainPhoto } from "@/components/mountain";
import { getPlan, getProgress, getVacancy, listSkills, listVacancies } from "@/lib/client/api";
import { countLabel, formatDate, matchPercent } from "@/lib/client/format";
import type { PlanView, SkillView } from "@/lib/server/present";
import type { VacancyAnalysis } from "@/lib/server/vacancies";

export function DashboardScreen() {
  const [skills, setSkills] = useState<SkillView[]>([]);
  const [analysis, setAnalysis] = useState<VacancyAnalysis | null>(null);
  const [plan, setPlan] = useState<PlanView | null>(null);
  const [vacancyCount, setVacancyCount] = useState(0);
  const [improved, setImproved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [skillData, vacancyData, progress] = await Promise.all([
          listSkills(),
          listVacancies(),
          getProgress(),
        ]);
        if (cancelled) return;
        setSkills(skillData.skills);
        setVacancyCount(vacancyData.vacancies.length);
        setImproved(progress.totals.improved);

        const latest = vacancyData.vacancies[0];
        if (!latest) {
          setLoading(false);
          return;
        }

        const vacancy = await getVacancy(latest.id);
        if (cancelled) return;
        setAnalysis(vacancy);
        const planId = vacancy.plans[0]?.id;
        if (planId) setPlan(await getPlan(planId));
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Не удалось загрузить главную.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorText message={error} />;

  const percent = analysis ? matchPercent(analysis.matches) : 0;
  const done = plan?.items.filter((item) => item.status === "done").length ?? 0;
  const nextTask = plan?.items.find((item) => item.status !== "done") ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-navy">Привет!</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">Твой карьерный путь становится ближе с каждым шагом.</p>
      </header>

      <article className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(30,32,56,0.06)]">
        <MountainPhoto variant="hero" className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/88 to-white/25 lg:bg-gradient-to-r lg:from-white lg:via-white/80 lg:to-white/10" />
        <div className="relative grid min-h-72 gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(160px,0.7fr)] lg:items-end">
          <div>
            <p className="text-sm text-muted">Текущая цель</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight break-words text-navy">
              {analysis ? analysis.vacancy.title : "Выбери цель"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {analysis
                ? "Развивай навыки и приближайся к своей цели"
                : skills.length > 0
                  ? "Навыки уже есть. Вставь вакансию, и здесь появится совпадение."
                  : "Собери профиль и вставь вакансию — совпадение появится здесь."}
            </p>
            {analysis ? (
              <>
                <p className="mt-6 text-sm text-muted">Совпадение навыков</p>
                <p className="text-4xl font-semibold tracking-tight text-navy">{percent}%</p>
                <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-navy/10">
                  <div className="h-full rounded-full bg-navy" style={{ width: `${percent}%` }} />
                </div>
                <Link
                  href={`/vacancies/${analysis.vacancy.id}`}
                  className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white"
                >
                  Просмотреть сравнение
                </Link>
              </>
            ) : (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href="/skills" className="inline-flex h-11 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white">
                  {skills.length > 0 ? "Проверить навыки" : "Добавить навыки"}
                </Link>
                <Link href="/analyze" className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-navy">
                  Разобрать вакансию
                </Link>
              </div>
            )}
          </div>
          <p className="max-w-[11rem] text-sm leading-6 text-navy/70 lg:justify-self-end lg:text-right">
            Большие цели начинаются с маленьких шагов
          </p>
        </div>
      </article>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/skills"
          icon={IconSkills}
          label="Мои навыки"
          value={countLabel(skills.length, "навык", "навыка", "навыков")}
          hint={improved > 0 ? `+${improved} с повторной оценки` : "в профиле"}
        />
        <StatCard
          href={analysis ? `/vacancies/${analysis.vacancy.id}` : "/analyze"}
          icon={IconAnalyze}
          label="Анализ вакансий"
          value={countLabel(vacancyCount, "активная", "активные", "активных")}
          hint={analysis ? `Последняя: ${formatDate(analysis.vacancy.createdAt)}` : "пока нет разборов"}
        />
        <StatCard
          href={plan ? `/plans/${plan.id}` : "/plan"}
          icon={IconPlan}
          label="План развития"
          value={plan ? countLabel(plan.items.length, "задача", "задачи", "задач") : "нет плана"}
          hint={plan ? `${done} выполнено` : "собирается из пробелов"}
        />
        <StatCard
          href={plan ? `/plans/${plan.id}` : "/compare"}
          icon={IconFlag}
          label="Следующая задача"
          value={nextTask?.skillName ?? "Пока нет"}
          hint={nextTask ? `Неделя ${nextTask.week}` : "откроется вместе с планом"}
        />
      </section>
    </div>
  );
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  hint,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link href={href} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition hover:ring-navy/15">
      <span className="grid size-9 place-items-center rounded-xl bg-canvas text-navy">
        <Icon className="size-4" />
      </span>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-1 truncate font-semibold text-navy">{value}</p>
      <p className="mt-1 truncate text-xs text-muted">{hint}</p>
    </Link>
  );
}

function ErrorText({ message }: { message: string }) {
  return <p className="rounded-2xl bg-bad-bg px-4 py-3 text-sm text-bad">{message}</p>;
}
