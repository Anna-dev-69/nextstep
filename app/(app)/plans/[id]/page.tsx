import type { Metadata } from "next";
import { Suspense } from "react";

import { PlanScreen } from "@/components/screens/plan-screen";

export const metadata: Metadata = { title: "План развития" };

export default function PlanByIdPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Открываю план…</p>}>
      <ResolvedPlan params={params} />
    </Suspense>
  );
}

async function ResolvedPlan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanScreen planId={id} />;
}
