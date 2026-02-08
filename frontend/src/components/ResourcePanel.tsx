/**
 * Solana AI City - Resource Panel Component
 * 
 * Displays game resources with animations and accessibility
 * Uses Framer Motion for smooth animations
 * WCAG AA compliant
 */

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

type ResourceType = 'gold' | 'wood' | 'stone' | 'food' | 'energy';

interface Resource {
  type: ResourceType;
  value: number;
  change: number; // per second
  icon: string;
}

interface ResourcePanelProps {
  resources: Record<ResourceType, number>;
  changes: Record<ResourceType, number>;
}

// ============================================================================
// Constants
// ============================================================================

const RESOURCE_ICONS: Record<ResourceType, string> = {
  gold: '💰',
  wood: '🪵',
  stone: '🪨',
  food: '🌾',
  energy: '⚡',
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  gold: 'Gold',
  wood: 'Wood',
  stone: 'Stone',
  food: 'Food',
  energy: 'Energy',
};

// ============================================================================
// Animations
// ============================================================================

const resourceVariants = {
  initial: { scale: 0.9, opacity: 0, x: -20 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  },
};

const changeVariants = {
  initial: { y: -10, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { 
    y: 10, 
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

// ============================================================================
// Resource Item Component
// ============================================================================

const ResourceItem = memo(function ResourceItem({ resource }: { resource: Resource }) {
  const isPositive = resource.change > 0;
  const isNegative = resource.change < 0;
  
  const changeClass = useMemo(() => {
    if (isPositive) return 'resource-change-positive';
    if (isNegative) return 'resource-change-negative';
    return '';
  }, [isPositive, isNegative]);
  
  return (
    <motion.div
      key={resource.type}
      className="resource-item"
      variants={resourceVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="listitem"
      aria-label={`${RESOURCE_LABELS[resource.type]}: ${resource.value.toLocaleString()}`}
    >
      {/* Icon */}
      <span 
        className="resource-icon" 
        aria-hidden="true"
      >
        {resource.icon}
      </span>
      
      {/* Value and Change */}
      <div className="resource-content">
        <span className="resource-value">
          {resource.value.toLocaleString()}
        </span>
        
        <AnimatePresence mode="wait">
          {resource.change !== 0 && (
            <motion.span
              key={resource.change}
              className={changeClass}
              variants={changeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {isPositive ? '+' : ''}{resource.change.toFixed(1)}/s
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress Bar */}
      <div 
        className="resource-bar" 
        role="progressbar"
        aria-valuenow={resource.value}
        aria-valuemin={0}
        aria-valuemax={10000}
        aria-label={`${RESOURCE_LABELS[resource.type]} progress`}
      >
        <motion.div
          className="resource-bar-fill"
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.min((resource.value / 10000) * 100, 100)}%` 
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
});

// ============================================================================
// Resource Panel Component
// ============================================================================

const ResourcePanel = memo(function ResourcePanel({ 
  resources, 
  changes 
}: ResourcePanelProps) {
  // Derive resource list from resources object
  const resourceList: Resource[] = useMemo(() => 
    (Object.entries(resources) as [ResourceType, number][]).map(([type, value]) => ({
      type,
      value,
      change: changes[type] || 0,
      icon: RESOURCE_ICONS[type],
    })),
    [resources, changes]
  );
  
  return (
    <section 
      className="resource-panel"
      role="region"
      aria-label="Game Resources"
    >
      <h2 className="sr-only">Resources</h2>
      
      {/* Header */}
      <header className="resource-header">
        <span className="resource-title">📦 Resources</span>
        <span className="resource-subtitle">Click to select building</span>
      </header>
      
      {/* Resource Grid */}
      <div className="resource-grid" role="list">
        {resourceList.map(resource => (
          <ResourceItem key={resource.type} resource={resource} />
        ))}
      </div>
      
      {/* Resource Summary */}
      <footer className="resource-footer" aria-label="Resource summary">
        <div className="resource-summary">
          <span className="summary-label">Total:</span>
          <span className="summary-value">
            {Object.values(resources).reduce((a, b) => a + b, 0).toLocaleString()}
          </span>
        </div>
      </footer>
    </section>
  );
});

// ============================================================================
// Styles (CSS-in-JS for portability)
// ============================================================================

const styles = `
  .resource-panel {
    @apply bg-slate-800 rounded-xl p-4 border border-slate-700;
  }
  
  .resource-header {
    @apply flex justify-between items-center mb-4;
  }
  
  .resource-title {
    @apply text-lg font-semibold text-white;
  }
  
  .resource-subtitle {
    @apply text-sm text-slate-400;
  }
  
  .resource-grid {
    @apply grid grid-cols-2 gap-3;
  }
  
  .resource-item {
    @apply bg-slate-900 rounded-lg p-3 flex items-center gap-3;
  }
  
  .resource-icon {
    @apply text-2xl;
  }
  
  .resource-content {
    @apply flex-1 min-w-0;
  }
  
  .resource-value {
    @apply text-white font-semibold block truncate;
  }
  
  .resource-change-positive {
    @apply text-green-400 text-xs font-medium;
  }
  
  .resource-change-negative {
    @apply text-red-400 text-xs font-medium;
  }
  
  .resource-bar {
    @apply h-1 bg-slate-700 rounded-full overflow-hidden mt-2;
  }
  
  .resource-bar-fill {
    @apply h-full bg-indigo-500 rounded-full;
  }
  
  .resource-footer {
    @apply mt-4 pt-3 border-t border-slate-700;
  }
  
  .resource-summary {
    @apply flex justify-between items-center text-slate-400;
  }
  
  .summary-label {
    @apply text-sm;
  }
  
  .summary-value {
    @apply text-white font-semibold;
  }
  
  .sr-only {
    @apply sr-only;
  }
`;

// ============================================================================
// Export
// ============================================================================

export default ResourcePanel;
export type { ResourceType, Resource, ResourcePanelProps };
