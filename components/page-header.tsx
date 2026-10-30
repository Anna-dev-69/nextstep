import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-medium text-accent">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight break-words text-ink sm:text-3xl">{title}</h1>
        {text ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">{text}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
