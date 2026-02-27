export default function LessonLoading() {
  return (
    <div className="container py-6 max-w-4xl animate-pulse">
      {/* Back link */}
      <div className="h-4 w-32 rounded bg-muted mb-6" />

      {/* Video placeholder */}
      <div className="aspect-video rounded-lg bg-muted mb-6" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-28 rounded bg-muted" />
          </div>
          <div className="h-7 w-72 rounded bg-muted" />
        </div>
        <div className="h-9 w-32 rounded bg-muted" />
      </div>

      {/* Content */}
      <div className="rounded-lg border bg-card p-6 mb-6 space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/6 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded bg-muted" />
        <div className="h-9 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}
