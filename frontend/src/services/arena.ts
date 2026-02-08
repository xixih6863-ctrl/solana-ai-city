/**
 * Solana AI City - PvP Arena System
 * PvP竞技场系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const ARENA_CONFIG = {
  // 排名范围
  MIN_ELO: 1000,
  MAX_ELO: 5000,
  
  // 匹配范围
  MATCHMAKING_RANGE: 200,
  
  // 赛季设置
  SEASON_DURATION_DAYS: 30,
  SEASON_REWARDS: {
    1: { usdc: 1000, title: '🏆 赛季冠军' },
    2: { usdc: 500, title: '🥈 亚军' },
    3: { usdc: 250, title: '🥉 季军' },
    top10: { usdc: 100 },
    top100: { usdc: 25 },
  },
  
  // 战斗奖励
  WIN_REWARD_BASE: 50,
  RANK_REWARD_MULTIPLIER: 0.1,
  
  // 每日战斗限制
  MAX_BATTLES_PER_DAY: 10,
  
  // 战斗回合
  MAX_TURNS: 20,
  TURNS_PER_MINUTE: 1,
};

// ===============================
// Types
// ===============================

export type BattleStatus = 'waiting' | 'preparing' | 'active' | 'ended';

export interface ArenaPlayer {
  userId: string;
  name: string;
  elo: number;
  rank: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  power: number;
  avatar: string;
}

export interface Battle {
  id: string;
  arenaId: string;
  playerA: ArenaPlayer;
  playerB: ArenaPlayer;
  status: BattleStatus;
  scoreA: number;
  scoreB: number;
  turns: BattleTurn[];
  winner: string | null;
  startTime: number;
  endTime: number | null;
  betAmount: number;
}

export interface BattleTurn {
  turnNumber: number;
  attacker: string;
  action: 'attack' | 'defend' | 'skill' | 'heal';
  damage: number;
  shield: number;
  hpRemaining: number;
  crit: boolean;
  timestamp: number;
}

export interface ArenaMatchmaking {
  waitingPlayers: ArenaPlayer[];
  averageWaitTime: number;
};

// ===============================
// Arena Store
// ===============================

function createArenaStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityArena')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        player: {
          elo: 1000,
          rank: 10000,
          wins: 0,
          losses: 0,
          winStreak: 0,
          bestStreak: 0,
          battlesToday: 0,
          lastBattleTime: 0,
        },
        battles: [],
        history: [],
        leaderboard: [],
        season: {
          id: 'season_1',
          startTime: Date.now(),
          endTime: Date.now() + ARENA_CONFIG.SEASON_DURATION_DAYS * 86400000,
          rewards: ARENA_CONFIG.SEASON_REWARDS,
        },
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityArena', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 加入匹配队列
    joinQueue: () => {
      // TODO: 实现匹配逻辑
      return { queuePosition: 1, estimatedWait: 30 };
    },
    
    // 开始战斗
    startBattle: (opponent: ArenaPlayer, betAmount: number = 0) => {
      const battle: Battle = {
        id: `battle_${Date.now()}`,
        arenaId: 'main_arena',
        playerA: { ...initialState.player, name: 'You' },
        playerB: opponent,
        status: 'preparing',
        scoreA: 0,
        scoreB: 0,
        turns: [],
        winner: null,
        startTime: Date.now(),
        endTime: null,
        betAmount,
      };
      
      update(state => ({
        ...state,
        battles: [...state.battles, battle],
      }));
      
      return battle;
    },
    
    // 执行回合
    executeTurn: (battleId: string, action: BattleTurn['action']) => {
      // TODO: 实现战斗逻辑
      return { damage: 50, hpRemaining: 100, crit: false };
    },
    
    // 结束战斗
    endBattle: (battleId: string, winner: string) => {
      update(state => {
        const battle = state.battles.find(b => b.id === battleId);
        if (!battle) return state;
        
        battle.status = 'ended';
        battle.winner = winner;
        battle.endTime = Date.now();
        
        // 更新玩家数据
        if (winner === 'playerA') {
          state.player.wins++;
          state.player.winStreak++;
          state.player.bestStreak = Math.max(state.player.bestStreak, state.player.winStreak);
          state.player.elo = calculateEloGain(state.player.elo, battle.playerB.elo, true);
        } else {
          state.player.losses++;
          state.player.winStreak = 0;
          state.player.elo = calculateEloGain(state.player.elo, battle.playerB.elo, false);
        }
        
        state.player.battlesToday++;
        state.player.lastBattleTime = Date.now();
        
        // 更新排名
        state.player.rank = calculateRank(state.player.elo);
        
        // 添加到历史
        state.history.unshift(battle);
        state.history = state.history.slice(0, 50); // 只保留最近50场
        
        return state;
      });
    },
    
    // 领取赛季奖励
    claimSeasonReward: () => {
      let reward = 0;
      let title = '';
      
      update(state => {
        const { player, season } = state;
        const topPercent = player.rank / 10000;
        
        if (topPercent <= 0.01) {
          reward = season.rewards[1].usdc;
          title = season.rewards[1].title;
        } else if (topPercent <= 0.1) {
          reward = season.rewards[2].usdc;
          title = season.rewards[2].title;
        } else if (topPercent <= 0.3) {
          reward = season.rewards[3].usdc;
          title = season.rewards[3].title;
        } else if (topPercent <= 0.1) {
          reward = season.rewards.top10.usdc;
        } else if (topPercent <= 0.1) {
          reward = season.rewards.top100.usdc;
        }
        
        return state;
      });
      
      return { reward, title };
    },
    
    // 重置每日次数
    resetDaily: () => {
      update(state => {
        state.player.battlesToday = 0;
        return state;
      });
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const arena = createArenaStore();

// ===============================
// Derived Stores
// ===============================

export const arenaStats = derived(arena, $arena => {
  const p = $arena.player;
  const total = p.wins + p.losses;
  const winRate = total > 0 ? (p.wins / total * 100).toFixed(1) : '0';
  
  return {
    elo: p.elo,
    rank: p.rank,
    wins: p.wins,
    losses: p.losses,
    winRate: `${winRate}%`,
    winStreak: p.winStreak,
    bestStreak: p.bestStreak,
    battlesToday: p.battlesToday,
    maxBattles: ARENA_CONFIG.MAX_BATTLES_PER_DAY,
    remainingBattles: ARENA_CONFIG.MAX_BATTLES_PER_DAY - p.battlesToday,
  };
});

export const arenaRankName = derived(arena, $arena => {
  const elo = $arena.player.elo;
  
  if (elo >= 4500) return '👑 传奇王者';
  if (elo >= 4000) return '⚔️ 大师';
  if (elo >= 3500) return '🏅 钻石';
  if (elo >= 3000) return '💎 铂金';
  if (elo >= 2500) return '🥇 黄金';
  if (elo >= 2000) return '🥈 白银';
  return '🥉 青铜';
});

// ===============================
// Helper Functions
// ===============================

export function calculateEloGain(
  currentElo: number, 
  opponentElo: number, 
  won: boolean,
  k: number = 32
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  const actual = won ? 1 : 0;
  return Math.max(0, Math.round(currentElo + k * (actual - expected)));
}

export function calculateRank(elo: number): number {
  // 简化的排名计算
  return Math.max(1, Math.round(10000 - (elo - 1000) * 0.5));
}

export function calculateSeasonProgress(
  startTime: number, 
  endTime: number
): number {
  const now = Date.now();
  const total = endTime - startTime;
  const elapsed = now - startTime;
  return Math.min(100, (elapsed / total) * 100);
}

export function getSeasonTimeRemaining(endTime: number): string {
  const remaining = endTime - Date.now();
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  
  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时`;
  return '即将结束';
}

// ===============================
// Battle Animations
// ===============================

export const BATTLE_ANIMATIONS = {
  attack: { duration: 500, effect: 'shake' },
  defend: { duration: 300, effect: 'shield' },
  skill: { duration: 1000, effect: 'glow' },
  heal: { duration: 500, effect: 'sparkle' },
  critical: { duration: 200, effect: 'flash' },
};

// ===============================
// Default Export
// ===============================

export default {
  arena,
  arenaStats,
  arenaRankName,
  ARENA_CONFIG,
  BATTLE_ANIMATIONS,
  calculateEloGain,
  calculateRank,
  calculateSeasonProgress,
  getSeasonTimeRemaining,
};
