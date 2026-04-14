import { cn } from '@/lib/utils';

interface SkeletonServiceGridProps {
  count?: number;
  className?: string;
}

/**
 * Skeleton loading state cho service grid.
 * Dùng khi fetch data, hoặc trong loading.tsx của /services page.
 */
export function SkeletonServiceGrid({ count = 6, className }: SkeletonServiceGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-primary border border-border rounded-2xl overflow-hidden"
        >
          {/* Image skeleton — aspect-[4/3] */}
          <div className="aspect-[4/3] skeleton" />

          {/* Content skeleton */}
          <div className="p-5 space-y-3">
            {/* Service name */}
            <div className="skeleton h-6 w-3/4 rounded-md" />
            {/* Price */}
            <div className="skeleton h-5 w-1/2 rounded-md" />
            {/* Duration */}
            <div className="skeleton h-4 w-1/3 rounded-md" />
            {/* CTA link */}
            <div className="skeleton h-4 w-1/4 rounded-md mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
