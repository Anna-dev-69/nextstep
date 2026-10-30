import type { Metadata } from "next";

import { CompareScreen } from "@/components/screens/compare-screen";

export const metadata: Metadata = { title: "Сравнение" };

export default function ComparePage() {
  return <CompareScreen />;
}
