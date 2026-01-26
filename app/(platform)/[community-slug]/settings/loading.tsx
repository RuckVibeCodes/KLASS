export default function SettingsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 w-32 rounded-md bg-muted" />

      <div className="rounded-lg border bg-card p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        </div>

        {/* Form fields */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
        ))}

        <div className="h-10 w-24 rounded-md bg-muted" />
      </div>
    </div>
  );
}
