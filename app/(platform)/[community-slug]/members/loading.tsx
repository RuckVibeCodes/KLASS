export default function MembersLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 rounded-md bg-muted" />
        <div className="h-9 w-32 rounded-md bg-muted" />
      </div>

      {/* Search bar */}
      <div className="h-10 w-full max-w-sm rounded-md bg-muted" />

      {/* Members grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
