export const typography = {
  display: { size: '64px', max: '72px', weight: 600, lineHeight: 1.2 },
  h1: { size: '48px', max: '56px', weight: 600, lineHeight: 1.25 },
  h2: { size: '40px', max: '48px', weight: 500, lineHeight: 1.3 },
  h3: { size: '32px', max: '36px', weight: 500, lineHeight: 1.35 },
  bodyL: { size: '18px', weight: 400, lineHeight: 1.5 },
  bodyM: { size: '16px', weight: 400, lineHeight: 1.5 },
  bodyS: { size: '14px', weight: 400, lineHeight: 1.45 },
};

export type TypographyScale = keyof typeof typography;
