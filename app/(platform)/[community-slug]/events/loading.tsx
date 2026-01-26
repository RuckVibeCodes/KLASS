export default function EventsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded-md bg-muted" />
        <div className="h-9 w-28 rounded-md bg-muted" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-lg border bg-card p-4">
            <div className="flex flex-col items-center justify-center rounded-md bg-muted px-3 py-2">
              <div className="h-4 w-8 rounded bg-muted/70" />
              <div className="h-6 w-6 rounded bg-muted/70 mt-1" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
