import React from 'react';
import { describe, it, expect } from 'vitest';
import { buildProductMetadata, buildProductJsonLd, productDescription } from '../seo';
import { products } from '../data';

const sample = products[0];

describe('seo helpers', () => {
  it('buildProductMetadata contains canonical and twitter image', () => {
    const meta = buildProductMetadata(sample as any);
    expect(meta.alternates?.canonical).toMatch(`/product/${sample.slug}`);
    expect(meta.openGraph?.images?.[0]?.url).toBe(sample.images[0]);
  });

  it('productDescription truncates long descriptions', () => {
    const long = { ...sample, description: 'x'.repeat(300) } as any;
    const desc = productDescription(long);
    expect(desc.length).toBeLessThanOrEqual(155 + 3);
    expect(desc.endsWith('...')).toBe(true);
  });

  it('buildProductJsonLd base shape snapshot', () => {
    const jsonLd = buildProductJsonLd(sample as any);
    expect(jsonLd).toMatchSnapshot();
  });
});
