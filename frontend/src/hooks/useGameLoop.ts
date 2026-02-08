/**
 * Solana AI City - Game Loop Hook
 * 
 * Manages the game loop, resources, buildings, and AI decisions
 * Optimized for performance with proper state management
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ResourceType = 'gold' | 'wood' | 'stone' | 'food' | 'energy';

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  energy: number;
}

export interface Building {
  id: string;
  type: string;
  level: number;
  position: {
    x: number;
    y: number;
  };
  placedAt: number; // timestamp
}

export interface AISuggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  expectedGain: string;
  timestamp: number;
}

export interface GameState {
  resources: Resources;
  buildings: Building[];
  population: number;
  score: number;
  level: number;
  tick: number;
  isRunning: boolean;
  aiSuggestions: AISuggestion[];
}

export interface GameActions {
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
  placeBuilding: (type: string, position: { x: number; y: number }) => void;
  upgradeBuilding: (buildingId: string) => void;
  removeBuilding: (buildingId: string) => void;
  setResources: (resources: Partial<Resources>) => void;
}

export interface UseGameLoopReturn {
  gameState: GameState;
  actions: GameActions;
  isRunning: boolean;
  tick: number;
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_RESOURCES: Resources = {
  gold: 1000,
  wood: 500,
  stone: 250,
  food: 1000,
  energy: 500,
};

const INITIAL_GAME_STATE: GameState = {
  resources: INITIAL_RESOURCES,
  buildings: [],
  population: 100,
  score: 100,
  level: 1,
  tick: 0,
  isRunning: true,
  aiSuggestions: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

// Calculate resource production based on buildings
const calculateProduction = useCallback((buildings: Building[]): Resources => {
  return buildings.reduce((acc, building) => {
    const multipliers: Record<string, Partial<Resources>> = {
      mine: { gold: 10 * building.level },
      lumber_mill: { wood: 10 * building.level },
      power_plant: { energy: 20 * building.level },
      farm: { food: 15 * building.level },
      research_lab: { gold: 5 * building.level }, // Technology gives gold bonus
    };
    
    const multiplier = multipliers[building.type];
    if (multiplier) {
      Object.entries(multiplier).forEach(([resource, amount]) => {
        acc[resource as ResourceType] += amount;
      });
    }
    
    return acc;
  }, { gold: 0, wood: 0, stone: 0, food: 0, energy: 0 });
}, []);

// Calculate population based on houses
const calculatePopulation = useCallback((buildings: Building[]): number => {
  return buildings
    .filter(b => b.type === 'house')
    .reduce((acc, b) => acc + (5 * b.level), 0);
}, []);

// Calculate score based on buildings and resources
const calculateScore = useCallback((buildings: Building[], resources: Resources): number => {
  return buildings.reduce((acc, b) => {
    return acc + (10 * b.level);
  }, 0) + Math.floor(resources.gold / 100);
}, []);

// Generate AI suggestions
const generateAISuggestions = useCallback((
  buildings: Building[],
  resources: Resources,
  production: Resources
): AISuggestion[] => {
  const suggestions: AISuggestion[] = [];
  
  // Check if player needs more population
  const populationBuildings = buildings.filter(b => b.type === 'house');
  if (populationBuildings.length < 3) {
    suggestions.push({
      id: 'need-houses',
      priority: 'high',
      action: 'build_house',
      reason: 'You need more population to grow your city',
      expectedGain: '+5 population per house',
      timestamp: Date.now(),
    });
  }
  
  // Check if player needs more gold
  if (resources.gold < 200 && production.gold < 20) {
    suggestions.push({
      id: 'need-gold',
      priority: 'high',
      action: 'build_mine',
      reason: 'Your gold production is too low',
      expectedGain: '+10 gold per second',
      timestamp: Date.now(),
    });
  }
  
  // Check if player needs more wood
  if (resources.wood < 100 && production.wood < 10) {
    suggestions.push({
      id: 'need-wood',
      priority: 'medium',
      action: 'build_lumber_mill',
      reason: 'You need wood for construction',
      expectedGain: '+10 wood per second',
      timestamp: Date.now(),
    });
  }
  
  // Check energy production
  const energyBuildings = buildings.filter(b => b.type === 'power_plant');
  if (energyBuildings.length < 1 && buildings.length > 5) {
    suggestions.push({
      id: 'need-energy',
      priority: 'medium',
      action: 'build_power_plant',
      reason: 'More buildings need energy',
      expectedGain: '+20 energy per second',
      timestamp: Date.now(),
    });
  }
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}, []);

// ============================================================================
// Main Hook
// ============================================================================

export function useGameLoop(initialState?: Partial<GameState>): UseGameLoopReturn {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
    ...initialState,
  });
  
  // Tick counter (for animations and timing)
  const [tick, setTick] = useState(0);
  
  // Refs for interval management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef(0);
  
  // Start game loop
  const start = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  }, []);
  
  // Stop game loop
  const stop = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: false }));
  }, []);
  
  // Toggle game loop
  const toggle = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);
  
  // Reset game
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    tickRef.current = 0;
    setTick(0);
    setGameState({
      ...INITIAL_GAME_STATE,
      ...initialState,
    });
  }, [initialState]);
  
  // Place a building
  const placeBuilding = useCallback((type: string, position: { x: number; y: number }) => {
    setGameState(prevState => {
      const buildingCost = getBuildingCost(type);
      
      // Check if player can afford
      if (
        prevState.resources.gold < buildingCost.gold ||
        prevState.resources.wood < buildingCost.wood ||
        prevState.resources.stone < buildingCost.stone
      ) {
        return prevState; // Can't afford
      }
      
      const newBuilding: Building = {
        id: `building-${Date.now()}`,
        type,
        level: 1,
        position,
        placedAt: Date.now(),
      };
      
      return {
        ...prevState,
        resources: {
          gold: prevState.resources.gold - buildingCost.gold,
          wood: prevState.resources.wood - buildingCost.wood,
          stone: prevState.resources.stone - buildingCost.stone,
        },
        buildings: [...prevState.buildings, newBuilding],
        score: prevState.score + 10,
      };
    });
  }, []);
  
  // Upgrade a building
  const upgradeBuilding = useCallback((buildingId: string) => {
    setGameState(prevState => {
      const building = prevState.buildings.find(b => b.id === buildingId);
      if (!building) return prevState;
      
      const upgradeCost = getBuildingCost(building.type, building.level + 1);
      
      if (
        prevState.resources.gold < upgradeCost.gold ||
        prevState.resources.wood < upgradeCost.wood ||
        prevState.resources.stone < upgradeCost.stone
      ) {
        return prevState;
      }
      
      return {
        ...prevState,
        resources: {
          gold: prevState.resources.gold - upgradeCost.gold,
          wood: prevState.resources.wood - upgradeCost.wood,
          stone: prevState.resources.stone - upgradeCost.stone,
        },
        buildings: prevState.buildings.map(b =>
          b.id === buildingId ? { ...b, level: b.level + 1 } : b
        ),
        score: prevState.score + 20,
      };
    });
  }, []);
  
  // Remove a building
  const removeBuilding = useCallback((buildingId: string) => {
    setGameState(prevState => {
      const building = prevState.buildings.find(b => b.id === buildingId);
      if (!building) return prevState;
      
      // Refund 50% of cost
      const refund = getBuildingCost(building.type, building.level);
      
      return {
        ...prevState,
        resources: {
          gold: prevState.resources.gold + Math.floor(refund.gold * 0.5),
          wood: prevState.resources.wood + Math.floor(refund.wood * 0.5),
          stone: prevState.resources.stone + Math.floor(refund.stone * 0.5),
        },
        buildings: prevState.buildings.filter(b => b.id !== buildingId),
        score: prevState.score - 5,
      };
    });
  }, []);
  
  // Set resources directly
  const setResources = useCallback((resources: Partial<Resources>) => {
    setGameState(prev => ({
      ...prev,
      resources: { ...prev.resources, ...resources },
    }));
  }, []);
  
  // Game loop effect
  useEffect(() => {
    if (!gameState.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    intervalRef.current = setInterval(() => {
      setGameState(prevState => {
        // Calculate production
        const production = calculateProduction(prevState.buildings);
        
        // Update resources
        const newResources = {
          gold: Math.min(prevState.resources.gold + production.gold, 10000),
          wood: Math.min(prevState.resources.wood + production.wood, 5000),
          stone: Math.min(prevState.resources.stone + production.stone, 2500),
          food: Math.min(prevState.resources.food + production.food, 10000),
          energy: Math.min(prevState.resources.energy + production.energy, 5000),
        };
        
        // Calculate population
        const population = calculatePopulation(prevState.buildings);
        
        // Calculate score
        const score = calculateScore(prevState.buildings, newResources);
        
        // Generate AI suggestions
        const aiSuggestions = generateAISuggestions(
          prevState.buildings,
          newResources,
          production
        );
        
        // Increment tick
        tickRef.current += 1;
        setTick(tickRef.current);
        
        return {
          ...prevState,
          resources: newResources,
          population,
          score,
          tick: tickRef.current,
          aiSuggestions,
        };
      });
    }, 1000); // Update every second
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isRunning, calculateProduction, calculatePopulation, calculateScore, generateAISuggestions]);
  
  // Memoize actions
  const actions = useMemo(() => ({
    start,
    stop,
    toggle,
    reset,
    placeBuilding,
    upgradeBuilding,
    removeBuilding,
    setResources,
  }), [start, stop, toggle, reset, placeBuilding, upgradeBuilding, removeBuilding, setResources]);
  
  return {
    gameState,
    actions,
    isRunning: gameState.isRunning,
    tick,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getBuildingCost(type: string, level = 1): Resources {
  const baseCost: Record<string, Resources> = {
    house: { gold: 100, wood: 50, stone: 0, food: 0, energy: 0 },
    mine: { gold: 50, wood: 0, stone: 100, food: 0, energy: 0 },
    lumber_mill: { gold: 50, wood: 100, stone: 0, food: 0, energy: 0 },
    power_plant: { gold: 200, wood: 100, stone: 100, food: 0, energy: 0 },
    farm: { gold: 50, wood: 0, stone: 50, food: 0, energy: 0 },
    research_lab: { gold: 500, wood: 200, stone: 200, food: 0, energy: 0 },
  };
  
  const base = baseCost[type] || { gold: 0, wood: 0, stone: 0, food: 0, energy: 0 };
  const multiplier = Math.pow(1.5, level - 1);
  
  return {
    gold: Math.floor(base.gold * multiplier),
    wood: Math.floor(base.wood * multiplier),
    stone: Math.floor(base.stone * multiplier),
    food: Math.floor(base.food * multiplier),
    energy: Math.floor(base.energy * multiplier),
  };
}

export type { Resources, Building, AISuggestion, GameState, GameActions };
