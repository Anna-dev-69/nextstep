"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { IconAnalyze, IconCompare, IconHome, IconPlan, IconSearch, IconSkills } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MountainPhoto } from "@/components/mountain";
import { listSkills, listVacancies } from "@/lib/client/api";
import { cn } from "@/lib/client/format";
import type { SkillView } from "@/lib/server/present";
import type { VacancyListItem } from "@/lib/server/vacancies";

const nav = [
  { href: "/dashboard", label: "Главная", short: "Главная", icon: IconHome, match: (path: string) => path === "/dashboard" },
  { href: "/skills", label: "Мои навыки", short: "Навыки", icon: IconSkills, match: (path: string) => path.startsWith("/skills") },
  { href: "/analyze", label: "Анализ вакансии", short: "Анализ", icon: IconAnalyze, match: (path: string) => path.startsWith("/analyze") },
  {
    href: "/compare",
    label: "Сравнение",
    short: "Сравнение",
    icon: IconCompare,
    match: (path: string) => path === "/compare" || path.startsWith("/vacancies"),
  },
  {
    href: "/plan",
    label: "План развития",
    short: "План",
    icon: IconPlan,
    match: (path: string) => path === "/plan" || path.startsWith("/plans"),
  },
];

export function Shell({ nav, children }: { nav: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {nav}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="lg:hidden">
              <Logo compact />
            </Link>
            <SearchBox />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppNav() {
  return <NavChrome pathname={usePathname()} />;
}

export function NavChrome({ pathname }: { pathname: string }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy text-white lg:flex">
        <div className="px-5 py-6">
          <Link href="/dashboard" className="text-white">
            <Logo light />
          </Link>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <Link href="/plan" className="mx-4 mt-4 mb-6 block overflow-hidden rounded-2xl">
          <span className="relative block h-28">
            <MountainPhoto variant="dusk" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <span className="absolute inset-x-3 bottom-3 block text-white">
              <span className="block text-sm font-semibold">Твой карьерный рост</span>
              <span className="mt-0.5 block text-xs text-white/75">Всё начинается с первого шага</span>
            </span>
          </span>
        </Link>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5 px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
          {nav.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium leading-tight",
                    active ? "text-navy" : "text-muted",
                  )}
                >
                  <Icon className="size-5" />
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: (typeof nav)[number];
  pathname: string;
}) {
  const active = item.match(pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
        active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  );
}

function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<SkillView[]>([]);
  const [vacancies, setVacancies] = useState<VacancyListItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open || ready) return;
    let cancelled = false;
    Promise.all([listSkills(), listVacancies()])
      .then(([skillData, vacancyData]) => {
        if (cancelled) return;
        setSkills(skillData.skills);
        setVacancies(vacancyData.vacancies);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, ready]);

  const needle = query.trim().toLowerCase();
  const skillHits = needle
    ? skills.filter((skill) => skill.name.toLowerCase().includes(needle)).slice(0, 5)
    : [];
  const vacancyHits = needle
    ? vacancies.filter((vacancy) => vacancy.title.toLowerCase().includes(needle)).slice(0, 5)
    : [];
  const visible = open && needle.length > 0;

  return (
    <div className="relative min-w-0 flex-1">
      <label className="relative block">
        <span className="sr-only">Поиск</span>
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder="Поиск по навыкам и вакансиям"
          className="h-11 w-full rounded-full border border-line bg-white pr-4 pl-10 text-sm outline-none ring-accent/25 placeholder:text-muted focus:ring-4"
        />
      </label>
      {visible ? (
        <div className="absolute top-[calc(100%+0.4rem)] z-30 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
          {skillHits.length === 0 && vacancyHits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">Ничего не нашлось.</p>
          ) : null}
          {skillHits.length > 0 ? (
            <ul className="py-1">
              {skillHits.map((skill) => (
                <li key={skill.id}>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-canvas"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      router.push(`/skills?q=${encodeURIComponent(skill.name)}`);
                    }}
                  >
                    <span className="text-muted">Навык · </span>
                    {skill.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {vacancyHits.length > 0 ? (
            <ul className="border-t border-line py-1">
              {vacancyHits.map((vacancy) => (
                <li key={vacancy.id}>
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-canvas"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      router.push(`/vacancies/${vacancy.id}`);
                    }}
                  >
                    <span className="text-muted">Вакансия · </span>
                    {vacancy.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
