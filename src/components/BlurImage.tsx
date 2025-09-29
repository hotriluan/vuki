"use client";
import Image, { ImageProps } from 'next/image';
import { BLUR_PLACEHOLDER } from '@/lib/placeholder';

interface BlurImageProps extends ImageProps {
  noBlur?: boolean;
}

export function BlurImage({ noBlur, placeholder, blurDataURL, alt, ...rest }: BlurImageProps) {
  const effectivePlaceholder = noBlur ? undefined : (placeholder || 'blur');
  const effectiveBlur = noBlur ? undefined : (blurDataURL || BLUR_PLACEHOLDER);
  return (
    <Image
      {...rest}
      alt={alt || ''}
      placeholder={effectivePlaceholder as any}
      blurDataURL={effectiveBlur}
    />
  );
}
