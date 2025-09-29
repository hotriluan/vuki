export const PROVINCE_SHIPPING_BASE: Record<string, number> = {
  'TP Hồ Chí Minh': 30000,
  'Hà Nội': 35000,
  'Đà Nẵng': 32000,
  'Khác': 40000
};

export function getProvinceShippingBase(name?: string): number {
  if (!name) return 30000; // default fallback
  return PROVINCE_SHIPPING_BASE[name] ?? 40000;
}
