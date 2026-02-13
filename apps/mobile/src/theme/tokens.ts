export const colors = {
  // Light theme foundation
  background: '#FFFFFF',
  backgroundSecondary: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceBorder: '#E5E7EB',

  // Text
  textPrimary: '#0B1F47',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',

  // Brand
  navy: '#1B3A6B',
  navyLight: '#2D5AA0',
  navyDark: '#0F2440',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Escrow states
  escrowHeld: '#1B3A6B',
  escrowReleased: '#22C55E',
  escrowPending: '#F59E0B',

  // Tabs
  tabActive: '#1B3A6B',
  tabInactive: '#9CA3AF',

  // Compatibility aliases for existing screens
  bg: '#FFFFFF',
  bgCard: '#FFFFFF',
  accent: '#1B3A6B',
  border: '#E5E7EB',
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
  amount: { fontSize: 32, fontWeight: '800' as const, color: colors.navy },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
};
