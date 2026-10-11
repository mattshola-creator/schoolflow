export default function MyDayLoading() {
  return (
    <div aria-label="Loading My Day" className="space-y-4 py-5">
      <div className="bg-surface-subtle h-24 animate-pulse rounded-2xl" />
      <div className="bg-surface-subtle h-72 animate-pulse rounded-2xl" />
    </div>
  );
}
