import type { Metadata } from "next";

import { PlanScreen } from "@/components/screens/plan-screen";

export const metadata: Metadata = { title: "План развития" };

export default function PlanPage() {
  return <PlanScreen />;
}
