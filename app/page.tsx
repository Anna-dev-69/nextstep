import Link from "next/link";

import { IconAnalyze, IconCompare, IconPlan, IconSkills } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MountainPhoto } from "@/components/mountain";

const features = [
  { title: "Анализ вакансий", icon: IconAnalyze, tone: "bg-[#eeedfe] text-accent" },
  { title: "План обучения", icon: IconPlan, tone: "bg-[#fff1e0] text-orange" },
  { title: "AI-рекомендации", icon: IconSkills, tone: "bg-good-bg text-good" },
  { title: "Прогресс и мотивация", icon: IconCompare, tone: "bg-white text-navy" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
        <div>
          <Logo />
          <h1 className="mt-10 max-w-xl text-4xl leading-tight font-semibold tracking-tight text-navy sm:text-6xl">
            Твой следующий шаг в карьере
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
            NextStep — персональный помощник по развитию карьеры. Анализируй вакансии, развивай навыки и достигай своих целей с помощью AI.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-navy px-6 text-sm font-semibold text-white"
          >
            Начать
          </Link>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="min-w-0">
                  <span className={`grid size-12 place-items-center rounded-2xl shadow-sm ring-1 ring-black/[0.04] ${feature.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-3 text-sm leading-5 font-medium text-navy">{feature.title}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(30,32,56,0.12)] lg:min-h-[520px]">
          <MountainPhoto variant="hero" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </main>
  );
}
