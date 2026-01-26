export default function CreateCommunityLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-pulse">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted mx-auto" />
          <div className="h-4 w-64 rounded bg-muted mx-auto" />
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted" />
            </div>
          ))}
          <div className="h-10 w-full rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
