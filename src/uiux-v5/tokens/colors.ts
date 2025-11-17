export const colors = {
  primaryMidnightBlue: '#0A192F',
  accentIntelligentTeal: '#33D1B8',
  successAlertGreen: '#48BB78',
  errorWarningRed: '#F56565',
  textCharcoalGray: '#2D3748',
  textLightGray: '#A0AEC0',
  surfaceOffWhite: '#F7FAFC',
  glassSurface: 'rgba(10, 25, 47, 0.65)',
  gradientCore: ['#0A192F', '#33D1B8', '#7FF7E5'] as const,
};

export type ColorToken = keyof typeof colors;
