/**
 * Solana AI City - Building Menu Component
 * 
 * Building selection menu with accessibility and animations
 * WCAG AA compliant
 */

import React, { memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface BuildingType {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: {
    gold: number;
    wood: number;
    stone: number;
  };
  production: {
    type: string;
    rate: number;
  };
  population: number;
}

interface BuildingMenuProps {
  buildingTypes: BuildingType[];
  selectedBuilding: string | null;
  onSelectBuilding: (building: BuildingType) => void;
  resources: {
    gold: number;
    wood: number;
    stone: number;
  };
}

// ============================================================================
// Default Buildings
// ============================================================================

const DEFAULT_BUILDINGS: BuildingType[] = [
  {
    id: 'house',
    name: 'House',
    icon: '🏠',
    description: 'Provides population for your city',
    cost: { gold: 100, wood: 50, stone: 0 },
    production: { type: 'population', rate: 5 },
    population: 5,
  },
  {
    id: 'mine',
    name: 'Gold Mine',
    icon: '⛏️',
    description: 'Produces gold over time',
    cost: { gold: 50, wood: 0, stone: 100 },
    production: { type: 'gold', rate: 10 },
    population: 0,
  },
  {
    id: 'lumber_mill',
    name: 'Lumber Mill',
    icon: '🪵',
    description: 'Produces wood for construction',
    cost: { gold: 50, wood: 100, stone: 0 },
    production: { type: 'wood', rate: 10 },
    population: 0,
  },
  {
    id: 'power_plant',
    name: 'Power Plant',
    icon: '⚡',
    description: 'Provides energy for buildings',
    cost: { gold: 200, wood: 100, stone: 100 },
    production: { type: 'energy', rate: 20 },
    population: 0,
  },
  {
    id: 'farm',
    name: 'Farm',
    icon: '🌾',
    description: 'Produces food for population',
    cost: { gold: 50, wood: 0, stone: 50 },
    production: { type: 'food', rate: 15 },
    population: 2,
  },
  {
    id: 'research_lab',
    name: 'Research Lab',
    icon: '🔬',
    description: 'Generates technology points',
    cost: { gold: 500, wood: 200, stone: 200 },
    production: { type: 'technology', rate: 5 },
    population: 10,
  },
];

// ============================================================================
// Animations
// ============================================================================

const menuVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
};

const selectionVariants = {
  idle: { scale: 1 },
  selected: { 
    scale: 1.02,
    boxShadow: '0 0 0 2px #6366F1, 0 0 20px rgba(99, 102, 241, 0.3)',
    transition: { duration: 0.2 }
  },
  disabled: { opacity: 0.5 },
};

// ============================================================================
// Cost Display Component
// ============================================================================

const CostDisplay = memo(function CostDisplay({ 
  type, 
  amount, 
  available 
}: { 
  type: string; 
  amount: number; 
  available: number;
}) {
  if (amount === 0) return null;
  
  const icons: Record<string, string> = {
    gold: '💰',
    wood: '🪵',
    stone: '🪨',
  };
  
  const hasEnough = available >= amount;
  
  return (
    <span 
      className={`cost-item ${hasEnough ? 'cost-enough' : 'cost-insufficient'}`}
      aria-label={`${type}: ${amount}, available: ${available}`}
    >
      <span aria-hidden="true">{icons[type]}</span>
      {amount}
    </span>
  );
});

// ============================================================================
// Building Button Component
// ============================================================================

const BuildingButton = memo(function BuildingButton({ 
  building,
  isSelected,
  canAfford,
  onSelect 
}: { 
  building: BuildingType;
  isSelected: boolean;
  canAfford: boolean;
  onSelect: () => void;
}) {
  const productionIcon = useMemo(() => {
    const icons: Record<string, string> = {
      population: '👥',
      gold: '💰',
      wood: '🪵',
      energy: '⚡',
      food: '🌾',
      technology: '🔬',
    };
    return icons[building.production.type] || '📦';
  }, [building.production.type]);
  
  return (
    <motion.button
      className={`building-button ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
      variants={selectionVariants}
      animate={isSelected ? 'selected' : 'idle'}
      whileHover={canAfford ? { scale: 1.02 } : {}}
      whileTap={canAfford ? { scale: 0.98 } : {}}
      onClick={onSelect}
      disabled={!canAfford}
      role="option"
      aria-selected={isSelected}
      aria-disabled={!canAfford}
      tabIndex={canAfford ? 0 : -1}
    >
      {/* Icon */}
      <div className="building-icon" aria-hidden="true">
        {building.icon}
      </div>
      
      {/* Info */}
      <div className="building-info">
        <span className="building-name">{building.name}</span>
        
        {/* Cost */}
        <div className="building-cost">
          <CostDisplay type="gold" amount={building.cost.gold} available={0} />
          <CostDisplay type="wood" amount={building.cost.wood} available={0} />
          <CostDisplay type="stone" amount={building.cost.stone} available={0} />
        </div>
        
        {/* Description */}
        <p className="building-description">{building.description}</p>
        
        {/* Production */}
        <div className="building-production">
          <span className="production-icon" aria-hidden="true">
            {productionIcon}
          </span>
          <span>+{building.production.rate}/{building.production.type}</span>
        </div>
      </div>
      
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="selection-indicator"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            aria-hidden="true"
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

// ============================================================================
// Building Menu Component
// ============================================================================

const BuildingMenu = memo(function BuildingMenu({
  buildingTypes = DEFAULT_BUILDINGS,
  selectedBuilding,
  onSelectBuilding,
  resources,
}: BuildingMenuProps) {
  // Check if player can afford building
  const canAfford = useCallback((building: BuildingType) => {
    return (
      resources.gold >= building.cost.gold &&
      resources.wood >= building.cost.wood &&
      resources.stone >= building.cost.stone
    );
  }, [resources]);
  
  // Handle building selection
  const handleSelect = useCallback((building: BuildingType) => {
    if (canAfford(building)) {
      onSelectBuilding(building);
    }
  }, [canAfford, onSelectBuilding]);
  
  return (
    <aside 
      className="building-menu"
      role="complementary"
      aria-label="Building Selection Menu"
    >
      {/* Header */}
      <header className="building-menu-header">
        <h2 className="menu-title">🏗️ Buildings</h2>
        <span className="menu-subtitle">
          {selectedBuilding ? 'Click map to place' : 'Select a building'}
        </span>
      </header>
      
      {/* Building List */}
      <menu 
        className="building-list" 
        role="listbox"
        aria-label="Available buildings"
      >
        <AnimatePresence mode="wait">
          {buildingTypes.map((building) => (
            <motion.li
              key={building.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              role="none"
            >
              <BuildingButton
                building={building}
                isSelected={selectedBuilding === building.id}
                canAfford={canAfford(building)}
                onSelect={() => handleSelect(building)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </menu>
      
      {/* Footer */}
      <footer className="building-menu-footer">
        <p className="footer-hint">
          💡 Tip: Build houses to increase population
        </p>
      </footer>
    </aside>
  );
});

// ============================================================================
// Export
// ============================================================================

export default BuildingMenu;
export type { BuildingType, BuildingMenuProps };
