export default function ProgramsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 w-40 rounded-md bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card overflow-hidden">
            <div className="h-40 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted" />
                <div className="h-3 w-8 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
