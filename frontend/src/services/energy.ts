/**
 * Solana AI City - Energy System
 * 能量消耗与恢复系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const ENERGY_CONFIG = {
  MAX_ENERGY: 100,
  ENERGY_REGEN_PER_HOUR: 10,
  ENERGY_REGEN_INTERVAL_MS: 60 * 60 * 1000, // 1 hour
  ENERGY_RECOVERY_ITEM_ID: 'energy_potion_small',
  ENERGY_PACKS: {
    small: { energy: 20, price: 1 },      // 1 USDC = 20能量
    medium: { energy: 100, price: 4 },     // 4 USDC = 100能量 (20% off)
    large: { energy: 250, price: 8 },     // 8 USDC = 250能量 (37.5% off)
    mega: { energy: 600, price: 18 },     // 18 USDC = 600能量 (50% off)
  },
};

// 动作能量消耗表
export const ACTION_ENERGY_COST = {
  // 建造
  BUILD_BASIC: 5,
  BUILD_ADVANCED: 15,
  BUILD_EPIC: 30,
  BUILD_LEGENDARY: 50,
  
  // 战斗
  ENTER_DUNGEON: 15,
  BATTLE_TURN: 3,
  USE_SKILL_MINOR: 10,
  USE_SKILL_MAJOR: 25,
  
  // 加速
  ACCELERATE_BUILD: 5,
  ACCELERATE_RESEARCH: 10,
  
  // 其他
  EXPLORE_MAP: 8,
  GATHER_RESOURCE: 5,
  CRAFT_ITEM: 12,
  SELL_ITEM: 2,
};

// ===============================
// Store
// ===============================

interface EnergyState {
  current: number;
  max: number;
  lastRegenTime: number;
  regenRate: number; // per hour
}

function createEnergyStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityEnergy')
    : null;
  
  const initialState: EnergyState = stored 
    ? JSON.parse(stored)
    : {
        current: ENERGY_CONFIG.MAX_ENERGY,
        max: ENERGY_CONFIG.MAX_ENERGY,
        lastRegenTime: Date.now(),
        regenRate: ENERGY_CONFIG.ENERGY_REGEN_PER_HOUR,
      };
  
  const { subscribe, set, update } = writable<EnergyState>(initialState);
  
  // 自动保存
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityEnergy', JSON.stringify(state));
    });
  }
  
  // 能量恢复计时器
  let regenInterval: ReturnType<typeof setInterval>;
  
  function startRegenTimer() {
    if (typeof window !== 'undefined') {
      regenInterval = setInterval(() => {
        update(state => {
          const now = Date.now();
          const hoursPassed = (now - state.lastRegenTime) / ENERGY_CONFIG.ENERGY_REGEN_INTERVAL_MS;
          
          if (hoursPassed >= 1) {
            const newEnergy = Math.min(
              state.current + Math.floor(hoursPassed * state.regenRate),
              state.max
            );
            return {
              ...state,
              current: newEnergy,
              lastRegenTime: now,
            };
          }
          return state;
        });
      }, 60000); // 每分钟检查
    }
  }
  
  // 启动计时器
  if (typeof window !== 'undefined') {
    startRegenTimer();
  }
  
  return {
    subscribe,
    
    // 恢复能量
    regen: (amount: number) => {
      update(state => ({
        ...state,
        current: Math.min(state.current + amount, state.max),
      }));
    },
    
    // 消耗能量
    consume: (amount: number): boolean => {
      let success = false;
      update(state => {
        if (state.current >= amount) {
          success = true;
          return { ...state, current: state.current - amount };
        }
        return state;
      });
      return success;
    },
    
    // 设置能量
    setEnergy: (amount: number) => {
      update(state => ({
        ...state,
        current: Math.min(amount, state.max),
        lastRegenTime: Date.now(),
      }));
    },
    
    // 增加上限
    increaseMax: (amount: number) => {
      update(state => ({
        ...state,
        max: state.max + amount,
        current: state.current + amount,
      }));
    },
    
    // 购买能量包
    buyPack: (packType: 'small' | 'medium' | 'large' | 'mega') => {
      const pack = ENERGY_CONFIG.ENERGY_PACKS[packType];
      if (pack) {
        update(state => ({
          ...state,
          current: Math.min(state.current + pack.energy, state.max),
        }));
        return pack.price;
      }
      return 0;
    },
    
    // 重置
    reset: () => {
      set({
        current: ENERGY_CONFIG.MAX_ENERGY,
        max: ENERGY_CONFIG.MAX_ENERGY,
        lastRegenTime: Date.now(),
        regenRate: ENERGY_CONFIG.ENERGY_REGEN_PER_HOUR,
      });
    },
  };
}

export const energy = createEnergyStore();

// ===============================
// Derived Stores
// ===============================

export const energyPercentage = derived(energy, $energy => {
  return ($energy.current / $energy.max) * 100;
});

export const energyTimeToFull = derived(energy, $energy => {
  if ($energy.current >= $energy.max) return 0;
  const needed = $energy.max - $energy.current;
  const hours = needed / $energy.regenRate;
  return Math.ceil(hours * 60); // minutes
});

export const canAffordEnergy = (amount: number) => {
  let result = false;
  energy.subscribe(s => {
    result = s.current >= amount;
  })();
  return result;
};

// ===============================
// Helper Functions
// ===============================

export function getActionEnergyCost(action: keyof typeof ACTION_ENERGY_COST): number {
  return ACTION_ENERGY_COST[action] || 5;
}

export function canPerformAction(action: keyof typeof ACTION_ENERGY_COST): boolean {
  return energy.subscribe(s => s.current >= ACTION_ENERGY_COST[action])();
}

export function performActionWithEnergy(action: keyof typeof ACTION_ENERGY_COST): boolean {
  const cost = ACTION_ENERGY_COST[action];
  return energy.consume(cost);
}

export function formatEnergyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

// ===============================
// Energy Notification
// ===============================

export function showEnergyWarning(): boolean {
  let lowEnergy = false;
  energy.subscribe(s => {
    if (s.current < s.max * 0.2) {
      lowEnergy = true;
    }
  })();
  return lowEnergy;
}

// ===============================
// Export Default
// ===============================

export default {
  energy,
  energyPercentage,
  energyTimeToFull,
  ACTION_ENERGY_COST,
  ENERGY_CONFIG,
  getActionEnergyCost,
  canPerformAction,
  performActionWithEnergy,
  formatEnergyTime,
};
