import type { Metadata } from "next";
import { Suspense } from "react";

import { CompareScreen } from "@/components/screens/compare-screen";

export const metadata: Metadata = { title: "Сравнение" };

export default function VacancyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Считаю совпадение с текущими навыками…</p>}>
      <ResolvedVacancy params={params} />
    </Suspense>
  );
}

async function ResolvedVacancy({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompareScreen vacancyId={id} />;
}
