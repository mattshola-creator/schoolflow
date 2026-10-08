export function LoadingSkeleton({
  label = "Loading content",
}: {
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className="animate-pulse space-y-3">
      <div className="bg-surface-subtle h-4 w-2/5 rounded-full" />
      <div className="bg-surface-subtle h-16 rounded-xl" />
      <div className="bg-surface-subtle h-16 rounded-xl" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
