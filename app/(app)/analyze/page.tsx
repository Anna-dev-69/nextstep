import type { Metadata } from "next";

import { AnalyzeScreen } from "@/components/screens/analyze-screen";

export const metadata: Metadata = { title: "Анализ вакансии" };

export default function AnalyzePage() {
  return <AnalyzeScreen />;
}
