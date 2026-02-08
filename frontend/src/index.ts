/**
 * Solana AI City - Component Exports
 * 
 * Centralized exports for all components
 */

// ============================================================================
// Components
// ============================================================================

export { default as ResourcePanel } from './ResourcePanel';
export type { ResourceType, Resource, ResourcePanelProps } from './ResourcePanel';

export { default as BuildingMenu } from './BuildingMenu';
export type { BuildingType, BuildingMenuProps } from './BuildingMenu';

export { default as AISuggestionPanel } from './AISuggestionPanel';
export type { AISuggestion, AISuggestionPanelProps, SuggestionPriority } from './AISuggestionPanel';

export { default as Leaderboard } from './Leaderboard';
export type { LeaderboardEntry, LeaderboardProps, LeaderboardTimeframe } from './Leaderboard';

export { default as Game } from './Game';

// Phase 3 Components (Added 2026-02-07)
export { default as GameMap } from './GameMap';
export type { GameMapProps, GridCell, BuildingInstance, TerrainType, Position } from './GameMap';

export { default as PlayerProfile } from './PlayerProfile';
export type { PlayerProfileProps, PlayerStats } from './PlayerProfile';

export { default as SettingsPanel } from './SettingsPanel';
export type { GameSettings, SettingsPanelProps } from './SettingsPanel';

export { default as TutorialOverlay } from './TutorialOverlay';
export type { TutorialStep, TutorialOverlayProps } from './TutorialOverlay';

export { default as AchievementsPanel } from './AchievementsPanel';
export type { Achievement, AchievementCategory, AchievementsPanelProps } from './AchievementsPanel';

// Phase 4 Components (Added 2026-02-07)
export { default as WalletConnect, WalletProvider, WalletButton, WalletModal } from './WalletConnect';
export type { WalletState, WalletContextValue, WalletConnectProps } from './WalletConnect';

export { default as TokenGate, TokenProvider, TokenBadge, useTokenGate } from './TokenGate';
export type { TokenRequirement, NFTRequirement, GateStatus, TokenGateProps } from './TokenGate';

export { default as AchievementNFT, NFTCollection } from './AchievementNFT';
export type { Achievement, NFTMintStatus, AchievementNFTProps } from './AchievementNFT';

export { default as BlockchainPanel } from './BlockchainPanel';
export type { BlockchainAccount, TokenAccount, NFTAccount, Transaction, BlockchainPanelProps } from './BlockchainPanel';

// ============================================================================
// Styles
// ============================================================================

export { default as gameTheme } from '../styles/game-theme';
export * from '../styles/game-theme';

export { default as animations } from '../styles/animations';
export * from '../styles/animations';

// ============================================================================
// Hooks
// ============================================================================

export { useGameLoop } from '../hooks/useGameLoop';
export type { Resources, Building, AISuggestion, GameState, GameActions } from '../hooks/useGameLoop';

// ============================================================================
// Constants
// ============================================================================

// Building types
export const BUILDING_TYPES = [
  {
    id: 'house',
    name: 'House',
    icon: '🏠',
    description: 'Provides population for your city',
    cost: { gold: 100, wood: 50, stone: 0 },
    production: { type: 'population' as const, rate: 5 },
    population: 5,
  },
  {
    id: 'mine',
    name: 'Gold Mine',
    icon: '⛏️',
    description: 'Produces gold over time',
    cost: { gold: 50, wood: 0, stone: 100 },
    production: { type: 'gold' as const, rate: 10 },
    population: 0,
  },
  {
    id: 'lumber_mill',
    name: 'Lumber Mill',
    icon: '🪵',
    description: 'Produces wood for construction',
    cost: { gold: 50, wood: 100, stone: 0 },
    production: { type: 'wood' as const, rate: 10 },
    population: 0,
  },
  {
    id: 'power_plant',
    name: 'Power Plant',
    icon: '⚡',
    description: 'Provides energy for buildings',
    cost: { gold: 200, wood: 100, stone: 100 },
    production: { type: 'energy' as const, rate: 20 },
    population: 0,
  },
  {
    id: 'farm',
    name: 'Farm',
    icon: '🌾',
    description: 'Produces food for population',
    cost: { gold: 50, wood: 0, stone: 50 },
    production: { type: 'food' as const, rate: 15 },
    population: 2,
  },
  {
    id: 'research_lab',
    name: 'Research Lab',
    icon: '🔬',
    description: 'Generates technology points',
    cost: { gold: 500, wood: 200, stone: 200 },
    production: { type: 'technology' as const, rate: 5 },
    population: 10,
  },
];

// AI Strategies
export const AI_STRATEGIES = [
  { id: 'balanced', name: '⚖️ Balanced', description: 'Balanced development' },
  { id: 'economy', name: '💰 Economy', description: 'Focus on gold production' },
  { id: 'military', name: '⚔️ Military', description: 'Focus on population' },
  { id: 'expansion', name: '🏗️ Expansion', description: 'Rapid expansion' },
  { id: 'technology', name: '🔬 Technology', description: 'Technology focus' },
];

// Game Constants
export const GAME_CONSTANTS = {
  TICK_INTERVAL: 1000, // 1 second
  MAX_RESOURCES: {
    gold: 10000,
    wood: 5000,
    stone: 2500,
    food: 10000,
    energy: 5000,
  },
  INITIAL_RESOURCES: {
    gold: 1000,
    wood: 500,
    stone: 250,
    food: 1000,
    energy: 500,
  },
  BUILDING_COST_MULTIPLIER: 1.5,
};

// ============================================================================
// Utility Functions
// ============================================================================

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const calculateResourceProduction = (buildings: any[]): Record<string, number> => {
  return buildings.reduce((acc, building) => {
    const multipliers: Record<string, number> = {
      mine: 10 * building.level,
      lumber_mill: 10 * building.level,
      power_plant: 20 * building.level,
      farm: 15 * building.level,
      research_lab: 5 * building.level,
    };
    
    const multiplier = multipliers[building.type];
    if (multiplier) {
      acc[building.production.type] += multiplier;
    }
    
    return acc;
  }, { gold: 0, wood: 0, stone: 0, food: 0, energy: 0 });
};

export const calculatePopulation = (buildings: any[]): number => {
  return buildings
    .filter(b => b.type === 'house')
    .reduce((acc, b) => acc + (5 * b.level), 0);
};

export const calculateScore = (buildings: any[], resources: any): number => {
  return buildings.reduce((acc, b) => acc + (10 * b.level), 0) + 
    Math.floor(resources.gold / 100);
};

export const canAfford = (
  building: any, 
  resources: Record<string, number>
): boolean => {
  return (
    resources.gold >= building.cost.gold &&
    resources.wood >= building.cost.wood &&
    resources.stone >= building.cost.stone
  );
};

export const getBuildingCost = (
  type: string, 
  level = 1
): Record<string, number> => {
  const baseCost: Record<string, Record<string, number>> = {
    house: { gold: 100, wood: 50, stone: 0 },
    mine: { gold: 50, wood: 0, stone: 100 },
    lumber_mill: { gold: 50, wood: 100, stone: 0 },
    power_plant: { gold: 200, wood: 100, stone: 100 },
    farm: { gold: 50, wood: 0, stone: 50 },
    research_lab: { gold: 500, wood: 200, stone: 200 },
  };
  
  const base = baseCost[type] || { gold: 0, wood: 0, stone: 0 };
  const multiplier = Math.pow(1.5, level - 1);
  
  return {
    gold: Math.floor(base.gold * multiplier),
    wood: Math.floor(base.wood * multiplier),
    stone: Math.floor(base.stone * multiplier),
  };
};

// ============================================================================
// Version
// ============================================================================

export const VERSION = '1.0.0';
export const VERSION_DATE = '2026-02-07';
