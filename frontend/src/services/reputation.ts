/**
 * Solana AI City - Reputation/Prestige System
 * 声望/荣誉系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const REPUTATION_CONFIG = {
  // 声望等级表
  LEVELS: [
    { level: 1, name: '新居民', reputation: 0, perks: ['基础功能'] },
    { level: 2, name: '探索者', reputation: 100, perks: ['解锁地牢'] },
    { level: 3, name: '建设者', reputation: 500, perks: ['解锁公会'] },
    { level: 4, name: '工程师', reputation: 2000, perks: ['解锁高级建筑'] },
    { level: 5, name: '战士', reputation: 5000, perks: ['解锁PvP'] },
    { level: 6, name: '大师', reputation: 15000, perks: ['解锁神话建筑'] },
    { level: 7, name: '传奇', reputation: 50000, perks: ['解锁特殊称号'] },
    { level: 8, name: '创世者', reputation: 100000, perks: ['解锁创世NFT', '称号: 创世者'] },
    { level: 9, name: '半神', reputation: 500000, perks: ['所有内容解锁', '专属皮肤'] },
    { level: 10, name: '神', reputation: 1000000, perks: ['永久VIP', '分红权'] },
  ],
  
  // 声望获取配置
  GAINS: {
    // 战斗
    BATTLE_WIN_EASY: 5,
    BATTLE_WIN_MEDIUM: 15,
    BATTLE_WIN_HARD: 30,
    BATTLE_WIN_BOSS: 50,
    
    // 任务
    DAILY_TASK_COMPLETE: 15,
    WEEKLY_TASK_COMPLETE: 100,
    ACHIEVEMENT_COMPLETE: { min: 50, max: 500 },
    
    // 公会
    GUILD_DONATION: 5,     // per USDC
    GUILD_TASK: 20,
    GUILD_WIN_WAR: 100,
    
    // 社交
    REFER_FRIEND: 200,
    HELPFUL_COMMENT: 10,
    
    // 连续登录
    CONSECUTIVE_LOGIN_BONUS: 5,  // per day, max +35
    
    // 特殊
    FIRST_PVP_VICTORY: 50,
    FIRST_DUNGEON_COMPLETE: 25,
    FIRST_ACHIEVEMENT: 30,
  },
  
  // 声望称号
  TITLES: [
    { id: 'newcomer', name: '新居民', requirement: 0 },
    { id: 'explorer', name: '探索者', requirement: 100 },
    { id: 'builder', name: '建设者', requirement: 500 },
    { id: 'engineer', name: '工程师', requirement: 2000 },
    { id: 'warrior', name: '战士', requirement: 5000 },
    { id: 'master', name: '大师', requirement: 15000 },
    { id: 'legend', name: '传奇', requirement: 50000 },
    { id: 'creator', name: '创世者', requirement: 100000 },
    { id: 'demigod', name: '半神', requirement: 500000 },
    { id: 'god', name: '神', requirement: 1000000 },
  ],
  
  // 称号奖励
  TITLE_BONUSES: {
    'newcomer': { bonus: 0, description: '无' },
    'explorer': { bonus: 0.05, description: '+5% 金币产出' },
    'builder': { bonus: 0.10, description: '+10% 金币产出' },
    'engineer': { bonus: 0.15, description: '+15% 金币产出' },
    'warrior': { bonus: 0.20, description: '+20% 战斗奖励' },
    'master': { bonus: 0.25, description: '+25% 声望获取' },
    'legend': { bonus: 0.30, description: '+30% 所有奖励' },
    'creator': { bonus: 0.40, description: '+40% 所有奖励' },
    'demigod': { bonus: 0.50, description: '+50% 所有奖励' },
    'god': { bonus: 1.00, description: '+100% 所有奖励' },
  },
};

// ===============================
// Types
// ===============================

interface ReputationState {
  current: number;
  totalEarned: number;
  level: number;
  title: string;
  consecutiveLoginDays: number;
  lastLoginTime: number;
  unlockedPerks: string[];
  achievements: string[];
}

// ===============================
// Store
// ===============================

function createReputationStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityReputation')
    : null;
  
  const initialState: ReputationState = stored 
    ? JSON.parse(stored)
    : {
        current: 0,
        totalEarned: 0,
        level: 1,
        title: '新居民',
        consecutiveLoginDays: 0,
        lastLoginTime: 0,
        unlockedPerks: ['基础功能'],
        achievements: [],
      };
  
  const { subscribe, set, update } = writable<ReputationState>(initialState);
  
  // 自动保存
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityReputation', JSON.stringify(state));
    });
  }
  
  // 每日连续登录奖励
  if (typeof window !== 'undefined') {
    setInterval(() => {
      update(state => {
        const now = Date.now();
        const lastLogin = state.lastLoginTime;
        
        // 检查是否新的一天
        if (lastLogin > 0) {
          const daysDiff = Math.floor((now - lastLogin) / (24 * 60 * 60 * 1000));
          
          if (daysDiff >= 1) {
            // 更新连续登录天数
            const newStreak = daysDiff >= 2 ? 1 : state.consecutiveLoginDays + 1;
            const cappedStreak = Math.min(newStreak, 7); // 最多7天加成
            
            return {
              ...state,
              consecutiveLoginDays: cappedStreak,
              lastLoginTime: now,
            };
          }
        } else {
          // 首次登录
          return {
            ...state,
            lastLoginTime: now,
          };
        }
        
        return state;
      });
    }, 60000); // 每分钟检查
  }
  
  return {
    subscribe,
    
    // 增加声望
    add: (amount: number) => {
      update(state => {
        const newTotal = state.current + amount;
        const { level, title, perks } = calculateLevelInfo(newTotal);
        
        return {
          ...state,
          current: newTotal,
          totalEarned: state.totalEarned + amount,
          level,
          title,
          unlockedPerks: perks,
        };
      });
    },
    
    // 记录成就
    unlockAchievement: (achievementId: string, reputationReward: number) => {
      update(state => {
        if (state.achievements.includes(achievementId)) {
          return state; // 已经解锁
        }
        
        const newTotal = state.current + reputationReward;
        const { level, title, perks } = calculateLevelInfo(newTotal);
        
        return {
          ...state,
          current: newTotal,
          totalEarned: state.totalEarned + reputationReward,
          achievements: [...state.achievements, achievementId],
          level,
          title,
          unlockedPerks: perks,
        };
      });
    },
    
    // 设置声望
    set: (amount: number) => {
      const { level, title, perks } = calculateLevelInfo(amount);
      update(state => ({
        ...state,
        current: amount,
        level,
        title,
        unlockedPerks: perks,
      }));
    },
    
    // 重置
    reset: () => {
      set({
        current: 0,
        totalEarned: 0,
        level: 1,
        title: '新居民',
        consecutiveLoginDays: 0,
        lastLoginTime: Date.now(),
        unlockedPerks: ['基础功能'],
        achievements: [],
      });
    },
  };
}

export const reputation = createReputationStore();

// ===============================
// Derived Stores
// ===============================

export const reputationProgress = derived(reputation, $rep => {
  const currentLevel = REPUTATION_CONFIG.LEVELS[$rep.level - 1];
  const nextLevel = REPUTATION_CONFIG.LEVELS[$rep.level];
  
  if (!nextLevel) {
    return { current: $rep.current, next: $rep.current, percent: 100, maxed: true };
  }
  
  const progress = $rep.current - currentLevel.reputation;
  const needed = nextLevel.reputation - currentLevel.reputation;
  const percent = Math.min((progress / needed) * 100, 100);
  
  return {
    current: $rep.current,
    next: nextLevel.reputation,
    percent,
    maxed: false,
    currentName: currentLevel.name,
    nextName: nextLevel.name,
  };
});

export const reputationBonus = derived(reputation, $rep => {
  const titleBonus = REPUTATION_CONFIG.TITLE_BONUSES[$rep.title as keyof typeof REPUTATION_CONFIG.TITLE_BONUSES];
  const loginBonus = Math.min($rep.consecutiveLoginDays * 0.01, 0.07); // 最多+7%
  
  return {
    goldBonus: (titleBonus?.bonus || 0) + loginBonus,
    battleBonus: (titleBonus?.bonus || 0) + loginBonus,
    reputationBonus: (titleBonus?.bonus || 0) * 0.5 + loginBonus,
    totalBonus: (titleBonus?.bonus || 0) + loginBonus,
  };
});

// ===============================
// Helper Functions
// ===============================

export function calculateLevelInfo(reputation: number): {
  level: number;
  title: string;
  perks: string[];
} {
  let level = 1;
  let title = '新居民';
  let perks = ['基础功能'];
  
  for (let i = REPUTATION_CONFIG.LEVELS.length - 1; i >= 0; i--) {
    if (reputation >= REPUTATION_CONFIG.LEVELS[i].reputation) {
      level = REPUTATION_CONFIG.LEVELS[i].level;
      title = REPUTATION_CONFIG.LEVELS[i].name;
      perks = REPUTATION_CONFIG.LEVELS[i].perks;
      break;
    }
  }
  
  return { level, title, perks };
}

export function getReputationToNextLevel(currentLevel: number): number {
  if (currentLevel >= REPUTATION_CONFIG.LEVELS.length) {
    return Infinity;
  }
  const next = REPUTATION_CONFIG.LEVELS[currentLevel];
  return next.reputation;
}

export function formatReputation(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

// ===============================
// Gain Functions
// ===============================

export function getBattleReputation(difficulty: 'easy' | 'medium' | 'hard' | 'boss'): number {
  return REPUTATION_CONFIG.GAINS[`BATTLE_WIN_${difficulty.toUpperCase()}` as keyof typeof REPUTATION_CONFIG.GAINS];
}

export function getDailyTaskReputation(): number {
  return REPUTATION_CONFIG.GAINS.DAILY_TASK_COMPLETE;
}

export function getAchievementReputation(): number {
  const { min, max } = REPUTATION_CONFIG.GAINS.ACHIEVEMENT_COMPLETE;
  return Math.floor(min + Math.random() * (max - min));
}

export function getGuildDonationReputation(usdcAmount: number): number {
  return Math.floor(usdcAmount * REPUTATION_CONFIG.GAINS.GUILD_DONATION);
}

export function getConsecutiveLoginBonus(): number {
  let bonus = 0;
  reputation.subscribe(s => {
    bonus = Math.min(s.consecutiveLoginDays, 7) * REPUTATION_CONFIG.GAINS.CONSECUTIVE_LOGIN_BONUS;
  })();
  return bonus;
}

export function getReferralBonus(): number {
  return REPUTATION_CONFIG.GAINS.REFER_FRIEND;
}

export function getHelpfulCommentBonus(): number {
  return REPUTATION_CONFIG.GAINS.HELPFUL_COMMENT;
}

// ===============================
// Apply Bonuses
// ===============================

export function applyGoldBonus(baseGold: number): number {
  let bonus = 0;
  reputationBonus.subscribe(b => {
    bonus = b.goldBonus;
  })();
  return Math.floor(baseGold * (1 + bonus));
}

export function applyBattleReward(baseReward: number): number {
  let bonus = 0;
  reputationBonus.subscribe(b => {
    bonus = b.battleBonus;
  })();
  return Math.floor(baseReward * (1 + bonus));
}

export function applyReputationGain(baseGain: number): number {
  let bonus = 0;
  reputationBonus.subscribe(b => {
    bonus = b.reputationBonus;
  })();
  return Math.floor(baseGain * (1 + bonus));
}

// ===============================
// Export Default
// ===============================

export default {
  reputation,
  reputationProgress,
  reputationBonus,
  REPUTATION_CONFIG,
  calculateLevelInfo,
  getReputationToNextLevel,
  formatReputation,
  getBattleReputation,
  getDailyTaskReputation,
  getAchievementReputation,
  getGuildDonationReputation,
  getConsecutiveLoginBonus,
  applyGoldBonus,
  applyBattleReward,
  applyReputationGain,
};
