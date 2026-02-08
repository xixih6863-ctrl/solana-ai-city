/**
 * Solana AI City - Game Theme Configuration
 * 
 * Centralized theme configuration for the game
 * Follows UI/UX Pro Max best practices
 */

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  // Primary Brand Colors (Indigo)
  primary: {
    main: '#6366F1',      // Indigo 500
    light: '#818CF8',      // Indigo 400
    lighter: '#A5B4FC',    // Indigo 300
    dark: '#4F46E5',       // Indigo 600
    darker: '#4338CA',     // Indigo 700
    muted: '#C7D2FE',     // Indigo 200
  },
  
  // Secondary Colors (Cyan)
  secondary: {
    main: '#22D3EE',      // Cyan 400
    light: '#67E8F9',      // Cyan 300
    lighter: '#A5E4E8',    // Cyan 200
    dark: '#06B6D4',       // Cyan 500
    darker: '#0891B2',     // Cyan 600
    muted: '#CFFAFE',      // Cyan 100
  },
  
  // Background Colors (Dark Slate)
  background: {
    app: '#0F172A',      // Slate 900
    card: '#1E293B',      // Slate 800
    cardHover: '#334155',  // Slate 700
    elevated: '#475569',   // Slate 600
    overlay: 'rgba(15, 23, 42, 0.8)',
  },
  
  // Text Colors
  text: {
    primary: '#F8FAFC',    // Slate 50
    secondary: '#CBD5E1',  // Slate 300
    muted: '#94A3B8',     // Slate 400
    disabled: '#64748B',   // Slate 500
    inverse: '#0F172A',   // Slate 900
  },
  
  // Status Colors
  status: {
    success: '#22C55E',  // Green 500
    successLight: '#86EFAC', // Green 300
    warning: '#F59E0B',  // Amber 500
    warningLight: '#FCD34D', // Amber 300
    error: '#EF4444',    // Red 500
    errorLight: '#FCA5A5', // Red 300
    info: '#3B82F6',      // Blue 500
    infoLight: '#93C5FD', // Blue 300
  },
  
  // Resource Colors
  resources: {
    gold: '#FBBF24',      // Amber 400
    wood: '#A3E635',      // Lime 400
    stone: '#94A3B8',     // Slate 400
    food: '#F97316',      // Orange 500
    energy: '#22D3EE',    // Cyan 400
    technology: '#A855F7', // Purple 500
    population: '#EC4899',  // Pink 500
  },
};

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  none: 'none',
  small: '0 1px 2px rgba(0, 0, 0, 0.3)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
  large: '0 10px 15px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.4)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  glowSuccess: '0 0 20px rgba(34, 197, 94, 0.3)',
  glowWarning: '0 0 20px rgba(245, 158, 11, 0.3)',
  glowError: '0 0 20px rgba(239, 68, 68, 0.3)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
};

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

// ============================================================================
// Spacing
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  fontFamily: {
    heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',        // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',      // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================================================
// Breakpoints
// ============================================================================

export const breakpoints = {
  sm: '640px',     // Mobile landscape
  md: '768px',     // Tablet portrait
  lg: '1024px',    // Tablet landscape / Small laptop
  xl: '1280px',    // Desktop
  '2xl': '1536px', // Large desktop
};

// ============================================================================
// Z-Index Scale
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// ============================================================================
// Transitions
// ============================================================================

export const transitions = {
  fast: '150ms ease-out',
  normal: '300ms ease-out',
  slow: '500ms ease-out',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ============================================================================
// Game-Specific Theme
// ============================================================================

export const gameTheme = {
  // Building Colors
  buildings: {
    house: {
      bg: 'rgba(99, 102, 241, 0.2)',
      border: '#6366F1',
      glow: 'rgba(99, 102, 241, 0.5)',
    },
    mine: {
      bg: 'rgba(251, 191, 36, 0.2)',
      border: '#FBBF24',
      glow: 'rgba(251, 191, 36, 0.5)',
    },
    lumberMill: {
      bg: 'rgba(163, 230, 53, 0.2)',
      border: '#A3E635',
      glow: 'rgba(163, 230, 53, 0.5)',
    },
    powerPlant: {
      bg: 'rgba(34, 211, 238, 0.2)',
      border: '#22D3EE',
      glow: 'rgba(34, 211, 238, 0.5)',
    },
    farm: {
      bg: 'rgba(249, 115, 22, 0.2)',
      border: '#F97316',
      glow: 'rgba(249, 115, 22, 0.5)',
    },
    researchLab: {
      bg: 'rgba(168, 85, 247, 0.2)',
      border: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.5)',
    },
  },
  
  // Map Colors
  map: {
    background: '#0F172A',
    grid: 'rgba(99, 102, 241, 0.1)',
    gridLines: 'rgba(99, 102, 241, 0.2)',
    terrain: {
      grass: '#1E293B',
      water: '#1E40AF',
      mountain: '#334155',
    },
  },
  
  // UI Colors
  ui: {
    panel: '#1E293B',
    panelBorder: 'rgba(99, 102, 241, 0.3)',
    buttonPrimary: '#6366F1',
    buttonSecondary: '#334155',
    input: '#0F172A',
    inputBorder: '#475569',
  },
};

// ============================================================================
// CSS Custom Properties (for Tailwind)
// ============================================================================

export const cssVariables = `
  :root {
    /* Colors */
    --color-primary: ${colors.primary.main};
    --color-primary-light: ${colors.primary.light};
    --color-primary-dark: ${colors.primary.dark};
    
    --color-secondary: ${colors.secondary.main};
    --color-secondary-light: ${colors.secondary.light};
    
    --color-background: ${colors.background.app};
    --color-background-card: ${colors.background.card};
    
    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-muted: ${colors.text.muted};
    
    /* Resources */
    --color-gold: ${colors.resources.gold};
    --color-wood: ${colors.resources.wood};
    --color-stone: ${colors.resources.stone};
    --color-food: ${colors.resources.food};
    --color-energy: ${colors.resources.energy};
    
    /* Spacing */
    --spacing-xs: ${spacing.xs};
    --spacing-sm: ${spacing.sm};
    --spacing-md: ${spacing.md};
    --spacing-lg: ${spacing.lg};
    --spacing-xl: ${spacing.xl};
    
    /* Border Radius */
    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-full: ${borderRadius.full};
    
    /* Transitions */
    --transition-fast: ${transitions.fast};
    --transition-normal: ${transitions.normal};
    --transition-slow: ${transitions.slow};
  }
`;

// ============================================================================
// Export
// ============================================================================

export default {
  colors,
  shadows,
  borderRadius,
  spacing,
  typography,
  breakpoints,
  zIndex,
  transitions,
  gameTheme,
  cssVariables,
};
