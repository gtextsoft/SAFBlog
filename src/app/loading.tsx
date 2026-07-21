export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6" aria-busy="true" aria-live="polite">
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-10 w-2/3 max-w-md animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-4/5 max-w-lg animate-pulse rounded bg-muted" />
    </div>
  );
}
