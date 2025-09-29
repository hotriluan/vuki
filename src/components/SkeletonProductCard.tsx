export function SkeletonProductCard() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-3 shadow-sm">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-5 w-24 rounded bg-gray-200" />
    </div>
  );
}
