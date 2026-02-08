/**
 * Solana AI City - Events System
 * 活动系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const EVENTS_CONFIG = {
  // 登录奖励配置
  LOGIN_BONUS: {
    DAY_1: { gold: 100, usdc: 0 },
    DAY_2: { gold: 200, usdc: 0 },
    DAY_3: { gold: 300, usdc: 1 },
    DAY_4: { gold: 500, usdc: 1 },
    DAY_5: { gold: 1000, usdc: 2 },
    DAY_6: { gold: 2000, usdc: 3 },
    DAY_7: { gold: 5000, usdc: 10, bonus: 'NFT碎片' },
  },
  
  // 活动类型
  TYPES: [
    'holiday',      // 节日活动
    'limited',      // 限时活动
    'season',       // 赛季活动
    'special',      // 特殊活动
    'partnership',  // 合作活动
  ],
  
  // 节日
  HOLIDAYS: [
    { name: '新年', date: '01-01', duration: 7 },
    { name: '春节', date: '02-01', duration: 15 },
    { name: '情人节', date: '02-14', duration: 3 },
    { name: '元宵节', date: '02-15', duration: 3 },
    { name: '妇女节', date: '03-08', duration: 1 },
    { name: '清明节', date: '04-04', duration: 3 },
    { name: '劳动节', date: '05-01', duration: 7 },
    { name: '儿童节', date: '06-01', duration: 3 },
    { name: '端午节', date: '06-12', duration: 3 },
    { name: '七夕', date: '08-01', duration: 3 },
    { name: '中秋节', date: '09-21', duration: 7 },
    { name: '国庆节', date: '10-01', duration: 7 },
    { name: '万圣节', date: '10-31', duration: 3 },
    { name: '感恩节', date: '11-24', duration: 3 },
    { name: '圣诞节', date: '12-25', duration: 7 },
  ],
};

// ===============================
// Types
// ===============================

export type EventType = typeof EVENTS_CONFIG.TYPES[number];

export interface Event {
  id: string;
  type: EventType;
  name: string;
  description: string;
  icon: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'ended';
  rewards: EventReward[];
  tasks: EventTask[];
  participants: number;
  banner?: string;
}

export interface EventReward {
  type: 'gold' | 'usdc' | 'nft' | 'item' | 'title';
  name: string;
  description: string;
  icon: string;
  rarity?: string;
  claimable: boolean;
  claimed: boolean;
}

export interface EventTask {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: EventReward;
}

export interface LoginBonus {
  day: number;
  rewards: {
    gold: number;
    usdc: number;
    bonus?: string;
  };
  claimed: boolean;
}

// ===============================
// Events Store
// ===============================

function createEventsStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityEvents')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        events: [],
        activeEvent: null,
        loginBonus: {
          currentStreak: 0,
          lastClaimTime: 0,
          bonuses: generateLoginBonuses(),
        },
        eventProgress: {},
        participatedEvents: [],
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityEvents', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 创建活动
    createEvent: (event: Omit<Event, 'id' | 'participants'>) => {
      const newEvent: Event = {
        ...event,
        id: `event_${Date.now()}`,
        participants: 0,
        status: event.startTime > Date.now() ? 'upcoming' : 'active',
      };
      
      update(state => ({
        ...state,
        events: [...state.events, newEvent],
      }));
      
      return newEvent;
    },
    
    // 开始活动
    startEvent: (eventId: string) => {
      update(state => {
        const event = state.events.find(e => e.id === eventId);
        if (event) {
          event.status = 'active';
        }
        return state;
      });
    },
    
    // 结束活动
    endEvent: (eventId: string) => {
      update(state => {
        const event = state.events.find(e => e.id === eventId);
        if (event) {
          event.status = 'ended';
        }
        return state;
      });
    },
    
    // 参与活动
    joinEvent: (eventId: string) => {
      update(state => {
        const event = state.events.find(e => e.id === eventId);
        if (event && !state.participatedEvents.includes(eventId)) {
          event.participants++;
          state.participatedEvents.push(eventId);
        }
        return state;
      });
    },
    
    // 更新任务进度
    updateTaskProgress: (eventId: string, taskId: string, progress: number) => {
      update(state => {
        const event = state.events.find(e => e.id === eventId);
        if (event) {
          const task = event.tasks.find(t => t.id === taskId);
          if (task) {
            task.progress = Math.min(task.progress + progress, task.target);
            if (task.progress >= task.target && !task.completed) {
              task.completed = true;
            }
          }
        }
        return state;
      });
    },
    
    // 领取活动奖励
    claimEventReward: (eventId: string, rewardIndex: number) => {
      let claimedReward: EventReward | null = null;
      
      update(state => {
        const event = state.events.find(e => e.id === eventId);
        if (event && event.rewards[rewardIndex]) {
          const reward = event.rewards[rewardIndex];
          if (reward.claimable && !reward.claimed) {
            reward.claimed = true;
            claimedReward = reward;
          }
        }
        return state;
      });
      
      return claimedReward;
    },
    
    // 领取每日登录奖励
    claimLoginBonus: () => {
      let reward: { gold: number; usdc: number; bonus?: string } | null = null;
      
      update(state => {
        const now = Date.now();
        const lastClaim = state.loginBonus.lastClaimTime;
        
        // 检查是否新的一天
        if (now - lastClaim < 24 * 60 * 60 * 1000) {
          return state;
        }
        
        // 计算连续登录天数
        const day = Math.min(state.loginBonus.currentStreak + 1, 7);
        
        const bonus = EVENTS_CONFIG.LOGIN_BONUS[`DAY_${day}` as keyof typeof EVENTS_CONFIG.LOGIN_BONUS];
        
        state.loginBonus.bonuses[day - 1].claimed = true;
        state.loginBonus.currentStreak = day;
        state.loginBonus.lastClaimTime = now;
        
        reward = bonus;
        
        return state;
      });
      
      return reward;
    },
    
    // 获取活动日历
    getEventCalendar: () => {
      // TODO: 生成活动日历
      return generateEventCalendar();
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const events = createEventsStore();

// ===============================
// Derived Stores
// ===============================

export const eventStats = derived(events, $events => {
  const activeEvents = $events.events.filter(e => e.status === 'active');
  const upcomingEvents = $events.events.filter(e => e.status === 'upcoming');
  
  return {
    totalEvents: $events.events.length,
    activeEvents: activeEvents.length,
    upcomingEvents: upcomingEvents.length,
    participatedCount: $events.participatedEvents.length,
    loginStreak: $events.loginBonus.currentStreak,
    canClaimLogin: canClaimLoginBonus($events.loginBonus),
  };
});

export const activeEvents = derived(events, $events => {
  return $events.events.filter(e => e.status === 'active');
});

export const upcomingEvents = derived(events, $events => {
  return $events.events.filter(e => e.status === 'upcoming');
});

// ===============================
// Helper Functions
// ===============================

function generateLoginBonuses(): LoginBonus[] {
  const bonuses: LoginBonus[] = [];
  
  for (let i = 1; i <= 7; i++) {
    const config = EVENTS_CONFIG.LOGIN_BONUS[`DAY_${i}` as keyof typeof EVENTS_CONFIG.LOGIN_BONUS];
    bonuses.push({
      day: i,
      rewards: {
        gold: config.gold,
        usdc: config.usdc,
        bonus: config.bonus,
      },
      claimed: false,
    });
  }
  
  return bonuses;
}

function canClaimLoginBonus(loginBonus: typeof events.loginBonus): boolean {
  const now = Date.now();
  const lastClaim = loginBonus.lastClaimTime;
  
  if (lastClaim === 0) return true;
  if (now - lastClaim < 24 * 60 * 60 * 1000) return false;
  
  // 检查是否有未领取的奖励
  const unclaimed = loginBonus.bonuses.find(b => !b.claimed);
  return !!unclaimed;
}

function generateEventCalendar() {
  const calendar: { date: string; event?: string }[] = [];
  const now = new Date();
  const year = now.getFullYear();
  
  // 添加节日
  EVENTS_CONFIG.HOLIDAYS.forEach(holiday => {
    calendar.push({
      date: `${year}-${holiday.date}`,
      event: holiday.name,
    });
  });
  
  return calendar;
}

// ===============================
// Event Templates
// ===============================

export const EVENT_TEMPLATES = {
  // 新年活动
  newyear: {
    type: 'holiday' as const,
    name: '🎊 新年庆典',
    description: '庆祝新年,领取专属奖励!',
    icon: '🎉',
    rewards: [
      { type: 'gold' as const, name: '新年红包', description: '10000金币', icon: '🧧', claimable: true, claimed: false },
      { type: 'nft' as const, name: '新年NFT', description: '限量版NFT', icon: '🏮', rarity: 'rare', claimable: true, claimed: false },
      { type: 'title' as const, name: '新年称号', description: '2026幸运儿', icon: '🏆', claimable: true, claimed: false },
    ],
    tasks: [
      { id: 'task_1', title: '登录游戏', description: '登录7天', target: 7, progress: 0, completed: false, claimed: false, reward: { type: 'gold', name: '金币', description: '5000', icon: '🪙' } },
      { id: 'task_2', title: '建造建筑', description: '建造10个建筑', target: 10, progress: 0, completed: false, claimed: false, reward: { type: 'usdc', name: 'USDC', description: '5', icon: '💎' } },
    ],
  },
  
  // 周年庆
  anniversary: {
    type: 'special' as const,
    name: '🎂 周年庆典',
    description: '庆祝Solana AI City周年!',
    icon: '🎂',
    rewards: [
      { type: 'nft' as const, name: '周年NFT', description: '创世版NFT', icon: '🌟', rarity: 'legendary', claimable: true, claimed: false },
      { type: 'usdc' as const, name: '周年红包', description: '100 USDC', icon: '💰', claimable: true, claimed: false },
    ],
    tasks: [
      { id: 'task_1', title: '邀请好友', description: '邀请3个好友', target: 3, progress: 0, completed: false, claimed: false, reward: { type: 'gold', name: '金币', description: '10000', icon: '🪙' } },
    ],
  },
  
  // 战斗周
  battleWeek: {
    type: 'limited' as const,
    name: '⚔️ 战斗周',
    description: '战斗奖励翻倍!',
    icon: '⚔️',
    rewards: [
      { type: 'usdc' as const, name: '战斗奖励', description: '战斗奖励+50%', icon: '💎', claimable: false, claimed: false },
    ],
    tasks: [
      { id: 'task_1', title: '赢得战斗', description: '赢得10场战斗', target: 10, progress: 0, completed: false, claimed: false, reward: { type: 'nft', name: '战士NFT', description: '稀有', icon: '🗡️' } },
    ],
  },
};

// ===============================
// Default Export
// ===============================

export default {
  events,
  eventStats,
  activeEvents,
  upcomingEvents,
  EVENTS_CONFIG,
  EVENT_TEMPLATES,
  canClaimLoginBonus,
  generateEventCalendar,
};
