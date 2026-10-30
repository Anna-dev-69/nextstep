import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingBlock } from "@/components/loading-block";
import { SkillsScreen } from "@/components/screens/skills-screen";

export const metadata: Metadata = { title: "Мои навыки" };

export default function SkillsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <SkillsScreen />
    </Suspense>
  );
}
