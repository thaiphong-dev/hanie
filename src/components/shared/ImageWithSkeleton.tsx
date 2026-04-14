'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithSkeletonProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  skeletonClassName?: string;
}

/**
 * Image component với skeleton loading.
 * - Không có src → hiện skeleton mãi (chờ owner upload ảnh)
 * - Có src → hiện skeleton trong khi tải, fade in khi xong
 * - fill mode: parent phải có `position: relative` và kích thước xác định
 */
export function ImageWithSkeleton({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  skeletonClassName,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Không có src hoặc lỗi → hiện skeleton
  if (!src || hasError) {
    return <div className={cn('skeleton', skeletonClassName ?? className)} />;
  }

  // fill mode: parent phải có position relative + overflow hidden
  if (fill) {
    return (
      <>
        {!loaded && (
          <div className={cn('skeleton absolute inset-0', skeletonClassName)} />
        )}
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          priority={priority}
          className={cn(
            'object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      </>
    );
  }

  // Fixed size mode
  return (
    <div className="relative overflow-hidden">
      {!loaded && (
        <div className={cn('skeleton absolute inset-0', skeletonClassName)} />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
