/**
 * Solana AI City - Gold/Coin System
 * 金币经济系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const GOLD_CONFIG = {
  MAX_STORAGE: 1000000, // 最大存储1M金币
  
  // 建筑金币产出 (每秒)
  BUILDING_OUTPUT: {
    basic: { min: 1, max: 3 },
    advanced: { min: 5, max: 10 },
    epic: { min: 15, max: 30 },
    legendary: { min: 50, max: 100 },
    mythic: { min: 200, max: 500 },
  },
  
  // 任务金币奖励
  TASK_REWARDS: {
    daily: { min: 100, max: 500 },
    weekly: { min: 1000, max: 5000 },
    achievement: { min: 50, max: 1000 },
  },
  
  // 战斗金币奖励
  BATTLE_REWARDS: {
    easy: { min: 10, max: 30 },
    medium: { min: 30, max: 80 },
    hard: { min: 80, max: 200 },
    boss: { min: 200, max: 500 },
  },
  
  // 金币消耗
  COSTS: {
    BUILD_BASIC: { min: 100, max: 500 },
    BUILD_ADVANCED: { min: 500, max: 2000 },
    BUILD_EPIC: { min: 2000, max: 10000 },
    BUILD_LEGENDARY: { min: 10000, max: 50000 },
    UPGRADE_BUILDING: 1000, // per level
    REPAIR_BUILDING: 500,   // 修复费用
    EXPAND_STORAGE: 5000,   // 扩展存储
    CRAFT_ITEM: 100,         // 制作费
    LIST_ITEM_FEE: 50,      // 上架费
  },
  
  // 兑换比例
  EXCHANGE_RATE: {
    GOLD_TO_USDC: 1000, // 1000金币 = 1 USDC
    USDC_TO_GOLD: 800,  // 1 USDC = 800金币 (bonus)
  },
  
  // 市场税
  MARKET_FEE_PERCENTAGE: 0.05, // 5%
  BURN_PERCENTAGE: 0.02,      // 2% 烧毁
};

// ===============================
// Store
// ===============================

interface GoldState {
  current: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdateTime: number;
}

function createGoldStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityGold')
    : null;
  
  const initialState: GoldState = stored 
    ? JSON.parse(stored)
    : {
        current: 1000, // 初始1000金币
        totalEarned: 0,
        totalSpent: 0,
        lastUpdateTime: Date.now(),
      };
  
  const { subscribe, set, update } = writable<GoldState>(initialState);
  
  // 自动保存
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityGold', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 增加金币
    add: (amount: number) => {
      update(state => ({
        ...state,
        current: Math.min(state.current + amount, GOLD_CONFIG.MAX_STORAGE),
        totalEarned: state.totalEarned + amount,
        lastUpdateTime: Date.now(),
      }));
    },
    
    // 减少金币
    spend: (amount: number): boolean => {
      let success = false;
      update(state => {
        if (state.current >= amount) {
          success = true;
          return {
            ...state,
            current: state.current - amount,
            totalSpent: state.totalSpent + amount,
          };
        }
        return state;
      });
      return success;
    },
    
    // 设置金币
    set: (amount: number) => {
      update(state => ({
        ...state,
        current: Math.min(amount, GOLD_CONFIG.MAX_STORAGE),
        lastUpdateTime: Date.now(),
      }));
    },
    
    // 增加存储上限
    expandStorage: (amount: number) => {
      GOLD_CONFIG.MAX_STORAGE += amount;
    },
    
    // 重置
    reset: () => {
      set({
        current: 1000,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdateTime: Date.now(),
      });
    },
  };
}

export const gold = createGoldStore();

// ===============================
// Derived Stores
// ===============================

export const goldFormatted = derived(gold, $gold => {
  return new Intl.NumberFormat('en-US').format($gold.current);
});

export const goldPercentage = derived(gold, $gold => {
  return ($gold.current / GOLD_CONFIG.MAX_STORAGE) * 100;
});

export const canAffordGold = (amount: number) => {
  let result = false;
  gold.subscribe(s => {
    result = s.current >= amount;
  })();
  return result;
};

// ===============================
// Income System
// ===============================

interface BuildingIncome {
  rate: number;
  buildings: number;
}

export function calculateBuildingIncome(buildingType: keyof typeof GOLD_CONFIG.BUILDING_OUTPUT): number {
  const config = GOLD_CONFIG.BUILDING_OUTPUT[buildingType];
  const random = Math.random();
  return Math.floor(config.min + random * (config.max - config.min));
}

export function calculateTotalIncome(buildings: BuildingIncome[]): number {
  return buildings.reduce((total, b) => total + (b.rate * b.buildings), 0);
}

export function claimBuildingIncome(amount: number) {
  gold.add(amount);
}

// ===============================
// Task Rewards
// ===============================

export function getDailyTaskReward(): number {
  const { min, max } = GOLD_CONFIG.TASK_REWARDS.daily;
  return Math.floor(min + Math.random() * (max - min));
}

export function getWeeklyTaskReward(): number {
  const { min, max } = GOLD_CONFIG.TASK_REWARDS.weekly;
  return Math.floor(min + Math.random() * (max - min));
}

export function getAchievementReward(): number {
  const { min, max } = GOLD_CONFIG.TASK_REWARDS.achievement;
  return Math.floor(min + Math.random() * (max - min));
}

// ===============================
// Battle Rewards
// ===============================

export function getBattleReward(difficulty: keyof typeof GOLD_CONFIG.BATTLE_REWARDS): number {
  const config = GOLD_CONFIG.BATTLE_REWARDS[difficulty];
  const random = Math.random();
  return Math.floor(config.min + random * (config.max - config.min));
}

// ===============================
// Build Costs
// ===============================

export function getBuildingCost(type: keyof typeof GOLD_CONFIG.COSTS.BUILD_BASIC): number {
  // Simplified cost calculation
  const baseCost = GOLD_CONFIG.COSTS[type] || 1000;
  return baseCost;
}

export function getUpgradeCost(currentLevel: number, baseCost: number = 1000): number {
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

export function getRepairCost(damagePercent: number, baseRepair: number = 500): number {
  return Math.floor(baseRepair * (damagePercent / 100));
}

// ===============================
// Exchange System
// ===============================

export function goldToUSDC(amount: number): number {
  return Math.floor(amount / GOLD_CONFIG.EXCHANGE_RATE.GOLD_TO_USDC);
}

export function USDCToGold(amount: number): number {
  return Math.floor(amount * GOLD_CONFIG.EXCHANGE_RATE.USDC_TO_GOLD);
}

export function exchangeGoldForUSDC(amount: number): number {
  if (!canAffordGold(amount)) return 0;
  
  const usdcAmount = goldToUSDC(amount);
  gold.spend(amount);
  return usdcAmount;
}

export function exchangeUSDCForGold(usdcAmount: number): number {
  const goldAmount = USDCToGold(usdcAmount);
  gold.add(goldAmount);
  return goldAmount;
}

// ===============================
// Market System
// ===============================

export function calculateMarketFee(salePrice: number): {
  fee: number;
  burn: number;
  sellerReceives: number;
} {
  const fee = Math.floor(salePrice * GOLD_CONFIG.MARKET_FEE_PERCENTAGE);
  const burn = Math.floor(salePrice * GOLD_CONFIG.BURN_PERCENTAGE);
  const sellerReceives = salePrice - fee;
  
  return { fee, burn, sellerReceives };
}

export function listItemPrice(fee: number, desiredProfit: number): number {
  return fee + desiredProfit;
}

// ===============================
// Utility Functions
// ===============================

export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export function formatGoldLong(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
}

// ===============================
// Export Default
// ===============================

export default {
  gold,
  goldFormatted,
  goldPercentage,
  GOLD_CONFIG,
  canAffordGold,
  getBuildingCost,
  getUpgradeCost,
  getRepairCost,
  getDailyTaskReward,
  getWeeklyTaskReward,
  getAchievementReward,
  getBattleReward,
  goldToUSDC,
  USDCToGold,
  formatGold,
  formatGoldLong,
};
