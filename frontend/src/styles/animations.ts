/**
 * Solana AI City - Animation Configuration
 * 
 * Centralized animations using Framer Motion
 * Optimized for 60fps performance
 */

import { Variants } from 'framer-motion';

// ============================================================================
// Common Animations
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
};

// ============================================================================
// Scale Animations
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  },
};

export const scaleOnHover: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// ============================================================================
// Building Animations
// ============================================================================

export const buildingPlacement: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -10 },
  visible: { 
    scale: 1, 
    opacity: 1,
    rotate: 0,
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 15
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    rotate: 10,
    transition: { duration: 0.2 }
  },
};

export const buildingSelection: Variants = {
  idle: { scale: 1 },
  selected: { 
    scale: 1.05,
    boxShadow: '0 0 0 3px #6366F1',
    transition: { duration: 0.2 }
  },
};

// ============================================================================
// Resource Animations
// ============================================================================

export const resourceChange: Variants = {
  initial: { scale: 1 },
  animate: (value: number) => {
    if (value > 0) {
      return {
        scale: [1, 1.1, 1],
        color: '#22C55E',
        transition: { duration: 0.3 }
      };
    } else if (value < 0) {
      return {
        scale: [1, 0.9, 1],
        color: '#EF4444',
        transition: { duration: 0.3 }
      };
    }
    return {};
  },
};

export const resourceBar: Variants = {
  initial: { width: 0 },
  animate: { 
    width: 'var(--width, 100%)',
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    }
  },
};

// ============================================================================
// Button Animations
// ============================================================================

export const buttonVariants: Variants = {
  idle: { 
    scale: 1,
    backgroundColor: 'rgba(99, 102, 241, 1)',
  },
  hover: { 
    scale: 1.02,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    transition: { duration: 0.15 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
  disabled: { 
    opacity: 0.5,
    scale: 1,
  },
};

// ============================================================================
// Modal/Dialog Animations
// ============================================================================

export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 }
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

// ============================================================================
// List Animations
// ============================================================================

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    }
  }),
};

export const staggeredContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
};

// ============================================================================
// Loading/Skeleton Animations
// ============================================================================

export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.2, 0.5, 0.2],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================================
// Notification/Toast Animations
// ============================================================================

export const toastSlideIn: Variants = {
  hidden: { 
    opacity: 0, 
    x: 100,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.2 }
  },
};

// ============================================================================
// Page Transitions
// ============================================================================

export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

// ============================================================================
// Game-Specific Animations
// ============================================================================

export const gameTick: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    }
  },
};

export const scorePulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      repeat: 0,
    }
  },
};

export const buildingPop: Variants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    }
  },
};

export const selectionRing: Variants = {
  initial: { scale: 0, opacity: 1 },
  animate: { 
    scale: 1.5,
    opacity: 0,
    transition: { 
      duration: 1, 
      repeat: Infinity,
      ease: 'easeOut',
    }
  },
};

// ============================================================================
// Performance Optimizations
// ============================================================================

/**
 * Animation performance tips:
 * 1. Use transform and opacity only
 * 2. Avoid animating layout properties (width, height, margin, etc.)
 * 3. Use will-change sparingly
 * 4. Prefer CSS animations for simple animations
 * 5. Use hardware acceleration (transform: translateZ(0))
 */

export const performanceTips = {
  useTransform: [
    'translateX',
    'translateY',
    'scale',
    'rotate',
    'skew',
  ].join(', '),
  
  avoidLayout: [
    'width',
    'height',
    'margin',
    'padding',
    'top',
    'left',
    'right',
    'bottom',
  ].join(', '),
  
  useOpacity: ['opacity'],
  
  hardwareAcceleration: 'transform: translateZ(0)',
};

// ============================================================================
// Animation Duration Presets
// ============================================================================

export const durationPresets = {
  instant: 0,
  fastest: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slowest: 0.5,
};

// ============================================================================
// Easing Presets
// ============================================================================

export const easingPresets = {
  easeOut: 'easeOut',
  easeIn: 'easeIn',
  easeInOut: 'easeInOut',
  linear: 'linear',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// ============================================================================
// Export All
// ============================================================================

export {
  // Common
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  
  // Scale
  scaleIn,
  scaleOnHover,
  
  // Building
  buildingPlacement,
  buildingSelection,
  
  // Resource
  resourceChange,
  resourceBar,
  
  // Button
  buttonVariants,
  
  // Modal
  modalVariants,
  overlayVariants,
  
  // List
  listItem,
  staggeredContainer,
  
  // Loading
  skeletonPulse,
  loadingSpinner,
  
  // Toast
  toastSlideIn,
  
  // Page
  pageTransition,
  
  // Game
  gameTick,
  scorePulse,
  buildingPop,
  selectionRing,
};

export default {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleOnHover,
  buildingPlacement,
  buildingSelection,
  resourceChange,
  resourceBar,
  buttonVariants,
  modalVariants,
  overlayVariants,
  listItem,
  staggeredContainer,
  skeletonPulse,
  loadingSpinner,
  toastSlideIn,
  pageTransition,
  gameTick,
  scorePulse,
  buildingPop,
  selectionRing,
  performanceTips,
  durationPresets,
  easingPresets,
};
