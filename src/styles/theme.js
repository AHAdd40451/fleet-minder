// Glassy UI Theme with Aesthetic Colors
export const theme = {
  colors: {
    // Primary glassy colors
    primary: {
      50: 'rgba(139, 92, 246, 0.05)',
      100: 'rgba(139, 92, 246, 0.1)',
      200: 'rgba(139, 92, 246, 0.2)',
      300: 'rgba(139, 92, 246, 0.3)',
      400: 'rgba(139, 92, 246, 0.4)',
      500: 'rgba(139, 92, 246, 0.6)',
      600: 'rgba(139, 92, 246, 0.8)',
      700: '#8B5CF6',
      800: '#7C3AED',
      900: '#6D28D9',
    },
    
    // Secondary colors
    secondary: {
      50: 'rgba(236, 72, 153, 0.05)',
      100: 'rgba(236, 72, 153, 0.1)',
      200: 'rgba(236, 72, 153, 0.2)',
      300: 'rgba(236, 72, 153, 0.3)',
      400: 'rgba(236, 72, 153, 0.4)',
      500: 'rgba(236, 72, 153, 0.6)',
      600: 'rgba(236, 72, 153, 0.8)',
      700: '#EC4899',
      800: '#DB2777',
      900: '#BE185D',
    },
    
    // Neutral glassy colors
    neutral: {
      50: 'rgba(248, 250, 252, 0.8)',
      100: 'rgba(241, 245, 249, 0.8)',
      200: 'rgba(226, 232, 240, 0.8)',
      300: 'rgba(203, 213, 225, 0.8)',
      400: 'rgba(148, 163, 184, 0.8)',
      500: 'rgba(100, 116, 139, 0.8)',
      600: 'rgba(71, 85, 105, 0.8)',
      700: 'rgba(51, 65, 85, 0.9)',
      800: 'rgba(30, 41, 59, 0.95)',
      900: 'rgba(15, 23, 42, 0.98)',
    },
    
    // Accent colors
    accent: {
      cyan: 'rgba(6, 182, 212, 0.6)',
      emerald: 'rgba(16, 185, 129, 0.6)',
      amber: 'rgba(245, 158, 11, 0.6)',
      rose: 'rgba(244, 63, 94, 0.6)',
    },
    
    // Background gradients
    background: {
      primary: ['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)'],
      secondary: ['rgba(6, 182, 212, 0.1)', 'rgba(16, 185, 129, 0.1)'],
      dark: ['rgba(15, 23, 42, 0.9)', 'rgba(30, 41, 59, 0.9)'],
    },
    
    // Text colors
    text: {
      primary: 'rgba(15, 23, 42, 0.9)',
      secondary: 'rgba(51, 65, 85, 0.8)',
      light: 'rgba(248, 250, 252, 0.9)',
      muted: 'rgba(100, 116, 139, 0.7)',
    },
  },
  
  // Glass effects
  glass: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Typography
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Shadows
  shadows: {
    small: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    medium: {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      elevation: 4,
    },
    large: {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      elevation: 8,
    },
  },
};

export default theme;