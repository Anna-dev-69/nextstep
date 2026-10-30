import { Suspense, type ReactNode } from "react";

import { AppNav, NavChrome, Shell } from "@/components/shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Shell
      nav={
        <Suspense fallback={<NavChrome pathname="" />}>
          <AppNav />
        </Suspense>
      }
    >
      {children}
    </Shell>
  );
}
