"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { createVacancy, listVacancies } from "@/lib/client/api";
import { countLabel, formatDate } from "@/lib/client/format";
import { rememberAnalysis } from "@/lib/client/latest-analysis";
import type { VacancyListItem } from "@/lib/server/vacancies";

export function AnalyzeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<VacancyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const remaining = Math.max(0, 40 - text.trim().length);

  useEffect(() => {
    let cancelled = false;
    listVacancies()
      .then((data) => {
        if (!cancelled) setVacancies(data.vacancies);
      })
      .catch((reason) => {
        if (!cancelled) {
          setVacancies([]);
          setListError(reason instanceof Error ? reason.message : "Не удалось загрузить список.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const created = await createVacancy({
        title: title.trim() || undefined,
        text,
      });
      rememberAnalysis(created);
      router.push(`/vacancies/${created.vacancy.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось разобрать вакансию.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Анализ вакансии"
        text="Вставь текст вакансии. Бесплатная модель разберёт обязанности и составит, что изучать и в каком порядке."
      />

      <form
        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label className="block text-sm font-medium">
          Название вакансии
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Frontend Developer"
            className="mt-2 h-11 w-full rounded-2xl border border-line px-3 outline-none ring-accent/30 focus:ring-4"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Описание вакансии
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
            minLength={40}
            rows={10}
            placeholder="Вставь обязанности, требования и блок «будет плюсом»."
            className="mt-2 w-full resize-y rounded-2xl border border-line px-3 py-3 text-sm leading-6 outline-none ring-accent/30 focus:ring-4"
          />
        </label>
        <p className="mt-2 text-xs text-muted">
          Нужно хотя бы 40 символов. Текст уходит в бесплатную модель, ответ сохраняется локально. Первый разбор может занять около минуты.
        </p>
        {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            {remaining > 0 ? `До анализа ещё ${remaining} символов` : `${text.trim().length} символов`}
          </p>
          <button
            type="submit"
            disabled={pending || remaining > 0}
            className="h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Модель читает вакансию…" : remaining > 0 ? `Ещё ${remaining} символов` : "Проанализировать"}
          </button>
        </div>
      </form>

      <section>
        <h2 className="text-lg font-semibold">Сохранённые вакансии</h2>
        {loading ? <p className="mt-3 text-sm text-muted">Загружаю сохранённые вакансии…</p> : null}
        {listError ? <p className="mt-3 text-sm text-bad">{listError}</p> : null}
        {!loading && !listError && vacancies.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Здесь появятся вакансии, которые ты уже разбирала.</p>
        ) : null}
        <ul className="mt-3 space-y-2">
          {vacancies.map((vacancy) => (
            <li key={vacancy.id}>
              <Link href={`/vacancies/${vacancy.id}`} className="block rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5 hover:ring-accent/40">
                <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{vacancy.title}</span>
                  <span className="text-sm text-muted">
                    {formatDate(vacancy.createdAt)} · {countLabel(vacancy.requirementCount, "тема", "темы", "тем")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
