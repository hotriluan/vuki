import { SkeletonProductCard } from '@/components/SkeletonProductCard';

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
      </div>
    </div>
  );
}
