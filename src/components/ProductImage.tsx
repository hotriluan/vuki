"use client";
import Image, { ImageProps } from 'next/image';
import { BLUR_PLACEHOLDER } from '@/lib/placeholder';
import { useState } from 'react';

interface ProductImageProps extends Omit<ImageProps, 'onError'> {
  fallbackText?: string;
}

export function ProductImage({ fallbackText = 'Image not available', alt, ...rest }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
        {fallbackText}
      </div>
    );
  }
  return (
    <Image
      alt={alt}
      onError={() => setErrored(true)}
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
      {...rest}
    />
  );
}
