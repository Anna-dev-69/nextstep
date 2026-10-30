export function LoadingBlock() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-xl bg-white" />
      <div className="h-56 animate-pulse rounded-3xl bg-white" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-3xl bg-white" />
        <div className="h-40 animate-pulse rounded-3xl bg-white" />
      </div>
    </div>
  );
}
