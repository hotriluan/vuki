// Design tokens cơ bản có thể sync với Tailwind.
export const colors = {
  brand: {
    primary: '#1e3a8a', // blue-800
    secondary: '#f59e0b', // amber-500
    accent: '#10b981', // emerald-500
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const radius = {
  sm: '2px',
  md: '4px',
  lg: '8px',
  pill: '9999px'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px'
};

export const tokens = { colors, radius, spacing };
