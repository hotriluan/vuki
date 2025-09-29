export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2 animate-pulse">
      <div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-gray-200" />
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-7 w-2/3 rounded bg-gray-200" />
          <div className="h-5 w-1/3 rounded bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
          <div className="h-3 w-4/6 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-40 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
