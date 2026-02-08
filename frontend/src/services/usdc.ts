/**
 * Solana AI City - USDC Token System
 * USDC代币经济系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const USDC_CONFIG = {
  // 精度
  DECIMALS: 6,
  
  // 质押收益
  STAKING_APY: 1.28, // 128% APY
  
  // NFT价格 (USDC)
  NFT_PRICES: {
    common: 10,
    rare: 50,
    epic: 200,
    legendary: 500,
    mythic: 1000,
  },
  
  // 游戏内购买
  PURCHASES: {
    LAND_BASIC: 10,
    LAND_ADVANCED: 50,
    LAND_EPIC: 100,
    SKILL_UNLOCK_MINOR: 5,
    SKILL_UNLOCK_MAJOR: 25,
    GACHA_COMMON: 10,
    GACHA_RARE: 50,
    GACHA_LEGENDARY: 100,
    GUILD_WAR_ENTRY: 20,
    ACCELERATE_ALL: 5,
    VIP_MEMBERSHIP_MONTHLY: 25,
  },
  
  // 市场交易
  MARKETPLACE: {
    MIN_LISTING_PRICE: 1,      // 最低上架价
    MAX_LISTING_PRICE: 10000,  // 最高上架价
    SELLER_FEE_PERCENTAGE: 0.025, // 卖家手续费 2.5%
    BUYER_FEE_PERCENTAGE: 0,      // 买家无手续费
  },
  
  // 奖励来源
  REWARDS: {
    DUNGEON_WIN_EASY: 5,
    DUNGEON_WIN_MEDIUM: 15,
    DUNGEON_WIN_HARD: 50,
    DUNGEON_WIN_BOSS: 100,
    LEADERBOARD_TOP_1: 1000,
    LEADERBOARD_TOP_10: 500,
    LEADERBOARD_TOP_100: 100,
    GUILD_WAR_PRIZE_1ST: 500,
    GUILD_WAR_PRIZE_2ND: 250,
    GUILD_WAR_PRIZE_3RD: 100,
  },
};

// ===============================
// Types
// ===============================

interface USDCState {
  balance: number;
  staked: number;
  stakingRewards: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdateTime: number;
}

interface StakeInfo {
  amount: number;
  startTime: number;
  duration: number; // days
  apy: number;
}

// ===============================
// Store
// ===============================

function createUSDCStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityUSDC')
    : null;
  
  const initialState: USDCState = stored 
    ? JSON.parse(stored)
    : {
        balance: 0, // 新用户从0开始
        staked: 0,
        stakingRewards: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdateTime: Date.now(),
      };
  
  const { subscribe, set, update } = writable<USDCState>(initialState);
  
  // 自动保存
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityUSDC', JSON.stringify(state));
    });
  }
  
  // 自动计算质押收益
  if (typeof window !== 'undefined') {
    setInterval(() => {
      update(state => {
        if (state.staked > 0) {
          const now = Date.now();
          const daysPassed = (now - state.lastUpdateTime) / (24 * 60 * 60 * 1000);
          const dailyReward = state.staked * (USDC_CONFIG.STAKING_APY - 1) / 365;
          const newRewards = state.stakingRewards + dailyReward * daysPassed;
          
          return {
            ...state,
            stakingRewards: newRewards,
            lastUpdateTime: now,
          };
        }
        return state;
      });
    }, 60000); // 每分钟更新
  }
  
  return {
    subscribe,
    
    // 充值/获得USDC
    deposit: (amount: number) => {
      update(state => ({
        ...state,
        balance: state.balance + amount,
        totalEarned: state.totalEarned + amount,
        lastUpdateTime: Date.now(),
      }));
    },
    
    // 提现/消费USDC
    withdraw: (amount: number): boolean => {
      let success = false;
      update(state => {
        if (state.balance >= amount) {
          success = true;
          return {
            ...state,
            balance: state.balance - amount,
            totalSpent: state.totalSpent + amount,
          };
        }
        return state;
      });
      return success;
    },
    
    // 质押
    stake: (amount: number): boolean => {
      let success = false;
      update(state => {
        if (state.balance >= amount) {
          success = true;
          return {
            ...state,
            balance: state.balance - amount,
            staked: state.staked + amount,
            lastUpdateTime: Date.now(),
          };
        }
        return state;
      });
      return success;
    },
    
    // 解除质押
    unstake: (amount: number): boolean => {
      let success = false;
      update(state => {
        if (state.staked >= amount) {
          success = true;
          const rewards = state.stakingRewards;
          return {
            ...state,
            staked: state.staked - amount,
            balance: state.balance + amount + rewards,
            stakingRewards: 0,
            lastUpdateTime: Date.now(),
          };
        }
        return state;
      });
      return success;
    },
    
    // 领取质押收益
    claimStakingRewards: () => {
      let rewards = 0;
      update(state => {
        rewards = state.stakingRewards;
        if (rewards > 0) {
          return {
            ...state,
            balance: state.balance + rewards,
            stakingRewards: 0,
            lastUpdateTime: Date.now(),
          };
        }
        return state;
      });
      return rewards;
    },
    
    // 市场购买
    buyNFT: (price: number): boolean => {
      const fee = Math.floor(price * USDC_CONFIG.MARKETPLACE.SELLER_FEE_PERCENTAGE);
      return this.withdraw(price + fee);
    },
    
    // 市场出售
    sellNFT: (price: number): number => {
      const fee = Math.floor(price * USDC_CONFIG.MARKETPLACE.SELLER_FEE_PERCENTAGE);
      const net = price - fee;
      this.deposit(net);
      return net;
    },
    
    // 重置
    reset: () => {
      set({
        balance: 0,
        staked: 0,
        stakingRewards: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdateTime: Date.now(),
      });
    },
  };
}

export const usdc = createUSDCStore();

// ===============================
// Derived Stores
// ===============================

export const usdcFormatted = derived(usdc, $usdc => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format($usdc.balance);
});

export const totalValue = derived(usdc, $usdc => {
  return $usdc.balance + $usdc.staked + $usdc.stakingRewards;
});

export const totalValueFormatted = derived(usdc, $usdc => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format($usdc.balance + $usdc.staked + $usdc.stakingRewards);
});

export const canAffordUSDC = (amount: number) => {
  let result = false;
  usdc.subscribe(s => {
    result = s.balance >= amount;
  })();
  return result;
};

// ===============================
// Staking System
// ===============================

export function calculateStakingRewards(
  amount: number, 
  days: number, 
  apy: number = USDC_CONFIG.STAKING_APY
): number {
  // 复利计算: A = P * (1 + r/n)^(n*t)
  const dailyRate = (apy - 1) / 365;
  const compoundingsPerDay = 1;
  const total = amount * Math.pow(1 + dailyRate / compoundingsPerDay, compoundingsPerDay * days);
  return total - amount;
}

export function getDailyStakingYield(amount: number): number {
  return amount * ((USDC_CONFIG.STAKING_APY - 1) / 365);
}

export function getMonthlyStakingYield(amount: number): number {
  return amount * ((USDC_CONFIG.STAKING_APY - 1) / 12);
}

export function getYearlyStakingYield(amount: number): number {
  return amount * (USDC_CONFIG.STAKING_APY - 1);
}

// ===============================
// NFT Purchase
// ===============================

export function getNFTPrice(rarity: keyof typeof USDC_CONFIG.NFT_PRICES): number {
  return USDC_CONFIG.NFT_PRICES[rarity] || 10;
}

export function getGachaPrice(
  type: 'common' | 'rare' | 'legendary'
): number {
  return USDC_CONFIG.PURCHASES[`GACHA_${type.toUpperCase()}` as keyof typeof USDC_CONFIG.PURCHASES] || 10;
}

// ===============================
// Reward Claims
// ===============================

export function getDungeonWinReward(
  difficulty: 'easy' | 'medium' | 'hard' | 'boss'
): number {
  return USDC_CONFIG.REWARDS[`DUNGEON_WIN_${difficulty.toUpperCase()}` as keyof typeof USDC_CONFIG.REWARDS] || 0;
}

export function getLeaderboardReward(rank: number): number {
  if (rank === 1) return USDC_CONFIG.REWARDS.LEADERBOARD_TOP_1;
  if (rank <= 10) return USDC_CONFIG.REWARDS.LEADERBOARD_TOP_10;
  if (rank <= 100) return USDC_CONFIG.REWARDS.LEADERBOARD_TOP_100;
  return 0;
}

export function getGuildWarReward(place: 1 | 2 | 3): number {
  return USDC_CONFIG.REWARDS[`GUILD_WAR_PRIZE_${place}ST` as keyof typeof USDC_CONFIG.REWARDS] || 0;
}

// ===============================
// Format Functions
// ===============================

export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSDCShort(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

// ===============================
// Export Default
// ===============================

export default {
  usdc,
  usdcFormatted,
  totalValue,
  totalValueFormatted,
  USDC_CONFIG,
  canAffordUSDC,
  getNFTPrice,
  getGachaPrice,
  getDungeonWinReward,
  getLeaderboardReward,
  getGuildWarReward,
  calculateStakingRewards,
  getDailyStakingYield,
  getMonthlyStakingYield,
  getYearlyStakingYield,
  formatUSDC,
  formatUSDCShort,
};
