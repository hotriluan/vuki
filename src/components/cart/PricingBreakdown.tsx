"use client";
import React from 'react';

interface Labels {
  subtotal: string;
  discount: string;
  shipping: string;
  free: string;
  vat: (rate: number) => string;
  total: string;
}

export interface PricingBreakdownProps {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  total: number;
  /** Currency formatting fn */
  format: (v: number) => string;
  /** Optional coupon / extra node inserted before total */
  couponNode?: React.ReactNode;
  /** VAT rate percent (e.g. 10) for label */
  vatRatePercent?: number;
  /** Hide VAT line if tax === 0 or this is false */
  showVatLine?: boolean;
  /** Style variant */
  variant?: 'aside' | 'drawer';
  className?: string;
  labels?: Partial<Labels>;
}

const DEFAULT_LABELS: Labels = {
  subtotal: 'Tạm tính',
  discount: 'Giảm giá',
  shipping: 'Phí ship',
  free: 'Miễn phí',
  vat: (r) => `VAT (${r}%)`,
  total: 'Tổng'
};

export function PricingBreakdown({
  subtotal,
  discountAmount,
  shippingFee,
  tax,
  total,
  format,
  couponNode,
  vatRatePercent = 10,
  showVatLine = true,
  variant = 'aside',
  className = '',
  labels = {}
}: PricingBreakdownProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const small = variant === 'drawer';
  // Provide consistent structure to ease future i18n.
  return (
    <div className={className} data-component="PricingBreakdown">
      <div className={`flex justify-between ${small ? 'text-xs' : 'text-sm'}`}>
        <span>{L.subtotal}</span>
        <span>{format(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className={`flex justify-between ${small ? 'text-[11px]' : 'text-xs'} text-green-600`}>
          <span>{L.discount}</span>
          <span>-{format(discountAmount)}</span>
        </div>
      )}
      <div className={`flex justify-between ${small ? 'text-[11px]' : 'text-xs'} text-gray-600`}>
        <span>{L.shipping}</span>
        <span>{shippingFee === 0 ? L.free : format(shippingFee)}</span>
      </div>
      {showVatLine && tax > 0 && (
        <div className={`flex justify-between ${small ? 'text-[11px]' : 'text-[11px]'} text-gray-600`}>
          <span>{L.vat(vatRatePercent)}</span>
            <span>{format(tax)}</span>
        </div>
      )}
      {couponNode}
      <hr className={small ? 'my-2' : 'my-3'} />
      <div className={`flex justify-between font-semibold ${small ? 'text-xs' : 'text-sm'}`}>
        <span>{L.total}</span>
        <span data-testid="cart-total">{format(total)}</span>
      </div>
    </div>
  );
}

export default PricingBreakdown;
