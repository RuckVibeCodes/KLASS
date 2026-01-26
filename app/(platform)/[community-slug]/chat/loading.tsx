export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col animate-pulse">
      {/* Chat header */}
      <div className="border-b p-4">
        <div className="h-6 w-32 rounded bg-muted" />
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 3 === 0 ? "justify-end" : ""}`}
          >
            {i % 3 !== 0 && (
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
            )}
            <div className="space-y-1.5 max-w-[60%]">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="rounded-lg bg-muted p-3">
                <div className="h-4 w-full rounded bg-muted/70" />
                <div className="h-4 w-2/3 rounded bg-muted/70 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}
