// Define CSS variables for the design tokens
export const tokens = {
  colors: {
    midnight: '#0F172A',
    offWhite: '#F8FAFC',
    teal: '#0F7D8D',
    textSecondary: '#64748B',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  }
};

export const motion = {
  entrance: {
    distance: 20,
    duration: 0.3,
  },
  exit: {
    distance: -20,
    duration: 0.2,
  },
};

// Export as CSS variables
export const cssVariables = `
  :root {
    --color-midnight: ${tokens.colors.midnight};
    --color-offWhite: ${tokens.colors.offWhite};
    --color-teal: ${tokens.colors.teal};
    --color-textSecondary: ${tokens.colors.textSecondary};
    --color-success: ${tokens.colors.success};
    --color-danger: ${tokens.colors.danger};
    --color-warning: ${tokens.colors.warning};
    --color-info: ${tokens.colors.info};

    --spacing-xs: ${tokens.spacing.xs};
    --spacing-sm: ${tokens.spacing.sm};
    --spacing-md: ${tokens.spacing.md};
    --spacing-lg: ${tokens.spacing.lg};
    --spacing-xl: ${tokens.spacing.xl};
  }
`;