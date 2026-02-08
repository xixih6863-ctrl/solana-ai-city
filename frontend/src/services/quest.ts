/**
 * Solana AI City - Quest System
 * 任务系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const QUEST_CONFIG = {
  DAILY_RESET_HOUR: 0, // 凌晨0点
  WEEKLY_RESET_DAY: 1, // 周一
  
  // 每日任务数量
  DAILY_QUEST_COUNT: 5,
  WEEKLY_QUEST_COUNT: 3,
  
  // 任务刷新
  REFRESH_COST: 10, // USDC
  
  // 任务类型
  TYPES: {
    BUILD: '建造',
    BATTLE: '战斗',
    COLLECT: '收集',
    EXPLORE: '探索',
    SOCIAL: '社交',
    TIME: '时间',
  },
};

// ===============================
// Types
// ===============================

export type QuestType = keyof typeof QUEST_CONFIG.TYPES;

export interface QuestReward {
  gold?: number;
  usdc?: number;
  reputation?: number;
  item?: string;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: QuestReward;
  expiresAt: number;
  difficulty: 1 | 2 | 3; // 1=简单, 2=中等, 3=困难
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt: number | null;
  reward: QuestReward;
  progress: number;
  maxProgress: number;
  tier: 1 | 2 | 3;
}

export interface QuestProgress {
  dailyStreak: number;
  weeklyStreak: number;
  dailyCompleted: number;
  weeklyCompleted: number;
  totalGoldEarned: number;
  totalUSDCEarned: number;
  achievementsUnlocked: number;
}

// ===============================
// Quest Templates
// ===============================

export const DAILY_QUEST_TEMPLATES: Omit<Quest, 'id' | 'progress' | 'completed' | 'claimed' | 'expiresAt'>[] = [
  { type: 'BUILD', title: '建造达人', description: '建造5个建筑', target: 5, reward: { gold: 200, reputation: 10 }, difficulty: 1, icon: '🏗️' },
  { type: 'BUILD', title: '建筑大师', description: '建造15个建筑', target: 15, reward: { gold: 500, reputation: 25 }, difficulty: 2, icon: '🏰' },
  { type: 'BATTLE', title: '战士之路', description: '赢得3场战斗', target: 3, reward: { gold: 150, reputation: 15 }, difficulty: 1, icon: '⚔️' },
  { type: 'BATTLE', title: '战斗精英', description: '赢得10场战斗', target: 10, reward: { gold: 800, reputation: 50 }, difficulty: 3, icon: '🏆' },
  { type: 'COLLECT', title: '收藏家', description: '收集1000金币', target: 1000, reward: { gold: 100, reputation: 5 }, difficulty: 1, icon: '💰' },
  { type: 'COLLECT', title: '大收藏家', description: '收集10000金币', target: 10000, reward: { gold: 2000, reputation: 100 }, difficulty: 3, icon: '🪙' },
  { type: 'EXPLORE', title: '探索者', description: '探索2个新区域', target: 2, reward: { gold: 300, reputation: 20 }, difficulty: 1, icon: '🗺️' },
  { type: 'SOCIAL', title: '社交达人', description: '与好友互动5次', target: 5, reward: { gold: 250, reputation: 30 }, difficulty: 1, icon: '👥' },
  { type: 'TIME', title: '准时登录', description: '连续登录3天', target: 3, reward: { gold: 400, reputation: 40 }, difficulty: 2, icon: '📅' },
];

export const WEEKLY_QUEST_TEMPLATES: Omit<Quest, 'id' | 'progress' | 'completed' | 'claimed' | 'expiresAt'>[] = [
  { type: 'BUILD', title: '周度建设', description: '建造50个建筑', target: 50, reward: { gold: 5000, reputation: 200, usdc: 10 }, difficulty: 2, icon: '🏗️' },
  { type: 'BATTLE', title: '周度战神', description: '赢得30场战斗', target: 30, reward: { gold: 3000, reputation: 150, usdc: 15 }, difficulty: 2, icon: '⚔️' },
  { type: 'COLLECT', title: '财富积累', description: '收集100000金币', target: 100000, reward: { gold: 10000, reputation: 300, usdc: 25 }, difficulty: 3, icon: '💎' },
  { type: 'SOCIAL', title: '公会荣耀', description: '为公会贡献5000经验', target: 5000, reward: { reputation: 500, usdc: 20 }, difficulty: 2, icon: '🏰' },
];

export const ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress' | 'tier'>[] = [
  { id: 'ach_001', name: '初学者', description: '完成首个任务', icon: '🎯', rarity: 'common', reward: { gold: 100 }, maxProgress: 1 },
  { id: 'ach_002', name: '任务大师', description: '完成100个任务', icon: '🏆', rarity: 'rare', reward: { gold: 5000, usdc: 10 }, maxProgress: 100 },
  { id: 'ach_003', name: '建筑专家', description: '建造500个建筑', icon: '🏗️', rarity: 'rare', reward: { gold: 8000, reputation: 100 }, maxProgress: 500 },
  { id: 'ach_004', name: '战斗之神', description: '赢得1000场战斗', icon: '⚔️', rarity: 'epic', reward: { usdc: 100, reputation: 500 }, maxProgress: 1000 },
  { id: 'ach_005', name: '收藏家', description: '获得100个NFT', icon: '🖼️', rarity: 'epic', reward: { usdc: 50, reputation: 200 }, maxProgress: 100 },
  { id: 'ach_006', name: '大富翁', description: '累计获得100万金币', icon: '💰', rarity: 'legendary', reward: { usdc: 500, reputation: 1000 }, maxProgress: 1000000 },
  { id: 'ach_007', name: '社交蝴蝶', description: '添加50个好友', icon: '👥', rarity: 'rare', reward: { gold: 3000, reputation: 150 }, maxProgress: 50 },
  { id: 'ach_008', name: '公会领袖', description: '创建公会', icon: '🏰', rarity: 'rare', reward: { reputation: 300 }, maxProgress: 1 },
  { id: 'ach_009', name: '全服第一', description: '排名达到前100', icon: '👑', rarity: 'legendary', reward: { usdc: 1000, reputation: 2000 }, maxProgress: 1 },
  { id: 'ach_010', title: '坚持不懈', description: '连续登录30天', icon: '🔥', rarity: 'epic', reward: { reputation: 400, usdc: 30 }, maxProgress: 30 },
];

// ===============================
// Quest Store
// ===============================

function createQuestStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityQuest')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        dailyQuests: [],
        weeklyQuests: [],
        achievements: ACHIEVEMENT_TEMPLATES.map(a => ({ ...a, unlocked: false, unlockedAt: null, progress: 0, tier: 1 })),
        progress: {
          dailyStreak: 0,
          weeklyStreak: 0,
          dailyCompleted: 0,
          weeklyCompleted: 0,
          totalGoldEarned: 0,
          totalUSDCEarned: 0,
          achievementsUnlocked: 0,
        },
        lastDailyReset: 0,
        lastWeeklyReset: 0,
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityQuest', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 生成每日任务
    generateDailyQuests: () => {
      update(state => {
        const quests: Quest[] = [];
        const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < QUEST_CONFIG.DAILY_QUEST_COUNT; i++) {
          const template = shuffled[i % shuffled.length];
          quests.push({
            ...template,
            id: `daily_${Date.now()}_${i}`,
            progress: 0,
            completed: false,
            claimed: false,
            expiresAt: Date.now() + 86400000,
          });
        }
        
        return { ...state, dailyQuests: quests };
      });
    },
    
    // 生成每周任务
    generateWeeklyQuests: () => {
      update(state => {
        const quests: Quest[] = [];
        const shuffled = [...WEEKLY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < QUEST_CONFIG.WEEKLY_QUEST_COUNT; i++) {
          const template = shuffled[i % shuffled.length];
          quests.push({
            ...template,
            id: `weekly_${Date.now()}_${i}`,
            progress: 0,
            completed: false,
            claimed: false,
            expiresAt: Date.now() + 7 * 86400000,
          });
        }
        
        return { ...state, weeklyQuests: quests };
      });
    },
    
    // 更新任务进度
    updateProgress: (questId: string, amount: number) => {
      update(state => {
        // 检查每日任务
        const dailyQuest = state.dailyQuests.find(q => q.id === questId);
        if (dailyQuest && !dailyQuest.completed) {
          dailyQuest.progress = Math.min(dailyQuest.progress + amount, dailyQuest.target);
          if (dailyQuest.progress >= dailyQuest.target) {
            dailyQuest.completed = true;
          }
        }
        
        // 检查每周任务
        const weeklyQuest = state.weeklyQuests.find(q => q.id === questId);
        if (weeklyQuest && !weeklyQuest.completed) {
          weeklyQuest.progress = Math.min(weeklyQuest.progress + amount, weeklyQuest.target);
          if (weeklyQuest.progress >= weeklyQuest.target) {
            weeklyQuest.completed = true;
          }
        }
        
        return state;
      });
    },
    
    // 领取任务奖励
    claimReward: (questId: string) => {
      let reward: QuestReward = {};
      
      update(state => {
        // 每日任务
        const dailyIdx = state.dailyQuests.findIndex(q => q.id === questId && q.completed && !q.claimed);
        if (dailyIdx !== -1) {
          reward = state.dailyQuests[dailyIdx].reward;
          state.dailyQuests[dailyIdx].claimed = true;
          state.progress.dailyCompleted++;
          state.progress.dailyStreak++;
        }
        
        // 每周任务
        const weeklyIdx = state.weeklyQuests.findIndex(q => q.id === questId && q.completed && !q.claimed);
        if (weeklyIdx !== -1) {
          reward = state.weeklyQuests[weeklyIdx].reward;
          state.weeklyQuests[weeklyIdx].claimed = true;
          state.progress.weeklyCompleted++;
        }
        
        // 更新统计
        if (reward.gold) state.progress.totalGoldEarned += reward.gold;
        if (reward.usdc) state.progress.totalUSDCEarned += reward.usdc;
        
        return state;
      });
      
      return reward;
    },
    
    // 解锁成就
    unlockAchievement: (achievementId: string) => {
      update(state => {
        const achievement = state.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedAt = Date.now();
          state.progress.achievementsUnlocked++;
        }
        return state;
      });
    },
    
    // 更新成就进度
    updateAchievementProgress: (achievementId: string, amount: number) => {
      update(state => {
        const achievement = state.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
          achievement.progress = Math.min(achievement.progress + amount, achievement.maxProgress);
          if (achievement.progress >= achievement.maxProgress) {
            achievement.unlocked = true;
            achievement.unlockedAt = Date.now();
            state.progress.achievementsUnlocked++;
          }
        }
        return state;
      });
    },
    
    // 重置每日
    resetDaily: () => {
      update(state => {
        state.dailyQuests = [];
        state.progress.dailyCompleted = 0;
        state.lastDailyReset = Date.now();
        return state;
      });
    },
    
    // 重置每周
    resetWeekly: () => {
      update(state => {
        state.weeklyQuests = [];
        state.progress.weeklyCompleted = 0;
        state.progress.weeklyStreak = 0;
        state.lastWeeklyReset = Date.now();
        return state;
      });
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const quest = createQuestStore();

// ===============================
// Derived Stores
// ===============================

export const questStats = derived(quest, $quest => {
  const p = $quest.progress;
  
  return {
    dailyStreak: p.dailyStreak,
    weeklyStreak: p.weeklyStreak,
    dailyCompleted: p.dailyCompleted,
    weeklyCompleted: p.weeklyCompleted,
    totalGoldEarned: p.totalGoldEarned,
    totalUSDCEarned: p.totalUSDCEarned,
    achievementsUnlocked: p.achievementsUnlocked,
    totalAchievements: $quest.achievements.length,
  };
});

export const dailyQuestProgress = derived(quest, $quest => {
  const total = $quest.dailyQuests.length;
  const completed = $quest.dailyQuests.filter(q => q.completed).length;
  const claimed = $quest.dailyQuests.filter(q => q.claimed).length;
  
  return {
    total,
    completed,
    claimed,
    remaining: total - completed,
    percent: total > 0 ? (completed / total * 100) : 0,
  };
});

export const weeklyQuestProgress = derived(quest, $quest => {
  const total = $quest.weeklyQuests.length;
  const completed = $quest.weeklyQuests.filter(q => q.completed).length;
  const claimed = $quest.weeklyQuests.filter(q => q.claimed).length;
  
  return {
    total,
    completed,
    claimed,
    remaining: total - completed,
    percent: total > 0 ? (completed / total * 100) : 0,
  };
});

// ===============================
// Default Export
// ===============================

export default {
  quest,
  questStats,
  dailyQuestProgress,
  weeklyQuestProgress,
  QUEST_CONFIG,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  ACHIEVEMENT_TEMPLATES,
};
