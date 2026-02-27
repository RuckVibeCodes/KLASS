export default function LessonEditorLoading() {
  return (
    <div className="container py-6 max-w-4xl animate-pulse">
      {/* Back link */}
      <div className="h-4 w-32 rounded bg-muted mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-9 w-20 rounded bg-muted" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <div className="h-9 w-24 rounded bg-muted" />
        <div className="h-9 w-20 rounded bg-muted" />
        <div className="h-9 w-28 rounded bg-muted" />
        <div className="h-9 w-16 rounded bg-muted" />
      </div>

      {/* Content area */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
        <div className="h-64 w-full rounded bg-muted" />
      </div>
    </div>
  );
}
