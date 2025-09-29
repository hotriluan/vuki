"use client";
import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface PriceProps {
  price: number;
  salePrice?: number;
  className?: string;
}

export function Price({ price, salePrice, className }: PriceProps) {
  const { format } = useCurrency();
  const isOnSale = typeof salePrice === 'number' && salePrice < price;
  const discountPercent = isOnSale ? Math.round(((price - (salePrice as number)) / price) * 100) : 0;
  return (
    <div className={className}>
      {isOnSale ? (
        <div className="flex items-baseline gap-2">
          <span className="text-brand-accent font-semibold">{format(salePrice!)}</span>
          <span className="text-xs line-through text-gray-500">{format(price)}</span>
          <span className="text-xs font-medium text-green-600">-{discountPercent}%</span>
        </div>
      ) : (
        <span className="font-medium">{format(price)}</span>
      )}
    </div>
  );
}
