export default function DashboardLoading() {
  return (
    <div aria-label="Loading operational overview" className="space-y-5 py-5">
      <div className="bg-surface-subtle h-24 animate-pulse rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="bg-surface-subtle h-32 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
