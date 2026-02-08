/**
 * Solana AI City - Leaderboard System
 * 排行榜系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const LEADERBOARD_CONFIG = {
  // 排行榜类型
  TYPES: {
    REPUTATION: { name: '声望榜', icon: '🏆', limit: 100 },
    GOLD: { name: '财富榜', icon: '💰', limit: 100 },
    ARENA: { name: '竞技榜', icon: '⚔️', limit: 100 },
    GUILD: { name: '公会榜', icon: '🏰', limit: 50 },
    ACHIEVEMENT: { name: '成就榜', icon: '🎖️', limit: 100 },
    DAILY: { name: '日榜', icon: '📅', limit: 50 },
    WEEKLY: { name: '周榜', icon: '📆', limit: 50 },
    SEASON: { name: '赛季榜', icon: '🏅', limit: 100 },
  },
  
  // 赛季设置
  SEASON_DURATION_DAYS: 30,
  
  // 更新间隔
  UPDATE_INTERVAL_MINUTES: 5,
};

// ===============================
// Types
// ===============================

export type LeaderboardType = keyof typeof LEADERBOARD_CONFIG.TYPES;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  value: number;
  previousRank: number;
  change: number;
  badge?: string;
}

export interface SeasonInfo {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

// ===============================
// Leaderboard Store
// ===============================

function createLeaderboardStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityLeaderboard')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        reputation: [],
        gold: [],
        arena: [],
        guild: [],
        achievement: [],
        daily: [],
        weekly: [],
        season: [],
        seasonInfo: {
          id: 'season_1',
          name: '第一赛季',
          startTime: Date.now(),
          endTime: Date.now() + LEADERBOARD_CONFIG.SEASON_DURATION_DAYS * 86400000,
          isActive: true,
        },
        myRanks: {
          reputation: null,
          gold: null,
          arena: null,
          guild: null,
          achievement: null,
          daily: null,
          weekly: null,
          season: null,
        },
        lastUpdated: Date.now(),
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityLeaderboard', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 更新排行榜
    updateLeaderboard: (type: LeaderboardType, entries: LeaderboardEntry[]) => {
      update(state => ({
        ...state,
        [type]: entries,
        lastUpdated: Date.now(),
      }));
    },
    
    // 更新我的排名
    updateMyRank: (type: LeaderboardType, rank: number) => {
      update(state => ({
        ...state,
        myRanks: {
          ...state.myRanks,
          [type]: rank,
        },
      }));
    },
    
    // 开始新赛季
    startNewSeason: () => {
      const seasonNum = parseInt(initialState.seasonInfo.id.split('_')[1]) + 1;
      
      update(state => ({
        ...state,
        season: [], // 清空赛季榜
        seasonInfo: {
          id: `season_${seasonNum}`,
          name: `第${seasonNum}赛季`,
          startTime: Date.now(),
          endTime: Date.now() + LEADERBOARD_CONFIG.SEASON_DURATION_DAYS * 86400000,
          isActive: true,
        },
      }));
    },
    
    // 获取排行榜
    getLeaderboard: (type: LeaderboardType, limit?: number): LeaderboardEntry[] => {
      let entries: LeaderboardEntry[] = [];
      
      // TODO: 从服务器获取真实数据
      // 模拟数据
      entries = generateMockLeaderboard(type, limit || 100);
      
      return entries;
    },
    
    // 获取我的排名
    getMyRank: (type: LeaderboardType): number | null => {
      return null; // TODO: 从服务器获取
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const leaderboard = createLeaderboardStore();

// ===============================
// Derived Stores
// ===============================

export const currentSeason = derived(leaderboard, $lb => $lb.seasonInfo);

export const seasonProgress = derived(leaderboard, $lb => {
  const { startTime, endTime } = $lb.seasonInfo;
  const now = Date.now();
  const total = endTime - startTime;
  const elapsed = now - startTime;
  
  return {
    percent: Math.min(100, (elapsed / total) * 100),
    daysRemaining: Math.ceil((endTime - now) / 86400000),
    isActive: $lb.seasonInfo.isActive,
  };
});

export const myLeaderboardStats = derived(leaderboard, $lb => {
  return {
    reputation: $lb.myRanks.reputation,
    gold: $lb.myRanks.gold,
    arena: $lb.myRanks.arena,
    guild: $lb.myRanks.guild,
    achievement: $lb.myRanks.achievement,
    daily: $lb.myRanks.daily,
    weekly: $lb.myRanks.weekly,
    season: $lb.myRanks.season,
  };
});

// ===============================
// Helper Functions
// ===============================

export function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🔥';
  if (rank <= 50) return '⭐';
  return '';
}

export function getRankTitle(rank: number): string {
  if (rank === 1) return '世界冠军';
  if (rank === 2) return '亚军';
  if (rank === 3) return '季军';
  if (rank <= 10) return '顶尖玩家';
  if (rank <= 50) return '精英';
  if (rank <= 100) return '高手';
  return '普通玩家';
}

export function getRankChange(change: number): {
  icon: string;
  color: string;
  text: string;
} {
  if (change > 0) {
    return { icon: '📈', color: 'text-green-500', text: `+${change}` };
  }
  if (change < 0) {
    return { icon: '📉', color: 'text-red-500', text: `${change}` };
  }
  return { icon: '➡️', color: 'text-gray-500', text: '-' };
}

export function formatValue(value: number, type: LeaderboardType): string {
  switch (type) {
    case 'GOLD':
    case 'DAILY':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    case 'REPUTATION':
    case 'ACHIEVEMENT':
      return value.toLocaleString();
    case 'ARENA':
      return `${value} Elo`;
    default:
      return value.toLocaleString();
  }
}

// ===============================
// Mock Data Generator
// ===============================

function generateMockLeaderboard(type: LeaderboardType, limit: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  
  const mockNames = [
    'CryptoKing', 'SolanaQueen', 'DeFiMaster', 'NFTPro', 'GameFiGuru',
    'BlockChainChamp', 'TokenTrader', 'MetaVerseHero', 'Web3Winner', 'ChainLeader',
    'DiamondHands', 'MoonWalker', 'RocketMan', 'StarGazer', 'UniverseBoss',
  ];
  
  for (let i = 1; i <= limit; i++) {
    let value: number;
    
    switch (type) {
      case 'REPUTATION':
        value = Math.floor(1000000 / i + Math.random() * 1000);
        break;
      case 'GOLD':
        value = Math.floor(10000000 / i + Math.random() * 10000);
        break;
      case 'ARENA':
        value = 1000 + Math.floor((5000 - 1000) * (1 - (i - 1) / (limit - 1)));
        break;
      case 'GUILD':
        value = Math.floor(1000000 / i + Math.random() * 5000);
        break;
      case 'ACHIEVEMENT':
        value = Math.floor(100 / i);
        break;
      case 'DAILY':
        value = Math.floor(10000 / i + Math.random() * 100);
        break;
      case 'WEEKLY':
        value = Math.floor(100000 / i + Math.random() * 1000);
        break;
      case 'SEASON':
        value = Math.floor(1000000 / i + Math.random() * 5000);
        break;
      default:
        value = 0;
    }
    
    entries.push({
      rank: i,
      userId: `user_${i}`,
      name: mockNames[i % mockNames.length],
      avatar: '👤',
      value,
      previousRank: i + Math.floor(Math.random() * 5) - 2,
      change: Math.floor(Math.random() * 10) - 5,
      badge: getRankBadge(i),
    });
  }
  
  return entries;
}

// ===============================
// Default Export
// ===============================

export default {
  leaderboard,
  currentSeason,
  seasonProgress,
  myLeaderboardStats,
  LEADERBOARD_CONFIG,
  getRankBadge,
  getRankTitle,
  getRankChange,
  formatValue,
};
