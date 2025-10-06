import React from 'react';
import { describe, it, expect } from 'vitest';
import { buildProductMetadata, buildProductJsonLd, productDescription } from '../seo';
import { products } from '../__legacyTestStubs';

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

  it('product json-ld contains required schema fields', () => {
    const jsonLd = buildProductJsonLd(sample as any) as any;
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe(sample.name);
    expect(jsonLd.offers).toBeTruthy();
    expect(jsonLd.offers['@type']).toBe('Offer');
    expect(jsonLd.offers.priceCurrency).toBe('VND');
    expect(typeof jsonLd.offers.price).toBe('number');
  });
});
