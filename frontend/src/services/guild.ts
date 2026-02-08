/**
 * Solana AI City - Guild System
 * 公会系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const GUILD_CONFIG = {
  CREATE_COST: 100,           // 创建公会: 100 USDC
  MAX_MEMBERS: 50,            // 最大成员数
  MAX_NAME_LENGTH: 30,        // 公会名最大长度
  MIN_LEVEL_TO_CREATE: 5,     // 创建所需等级
  WAR_ENTRY_COST: 20,         // 公会战报名费
  WAR_DURATION_MINUTES: 30,   // 公会战时长
  WAR_PRIZE_POOL: 1000,       // 奖池: 1000 USDC
  
  // 公会等级
  LEVELS: [
    { level: 1, members: 10, exp: 0 },
    { level: 2, members: 15, exp: 1000 },
    { level: 3, members: 20, exp: 5000 },
    { level: 4, members: 30, exp: 20000 },
    { level: 5, members: 50, exp: 100000 },
  ],
  
  // 职位
  ROLES: [' founder', 'elder', 'member', 'recruit'],
};

// ===============================
// Types
// ===============================

export type GuildRole = 'founder' | 'elder' | 'member' | 'recruit';

export interface GuildMember {
  userId: string;
  name: string;
  avatar: string;
  role: GuildRole;
  contribution: number;
  joinedAt: number;
  lastActive: number;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  emblem: string; // emoji
  level: number;
  exp: number;
  members: GuildMember[];
  foundedAt: number;
  isRecruiting: boolean;
  tags: string[];
}

export interface GuildApplication {
  id: string;
  guildId: string;
  userId: string;
  message: string;
  appliedAt: number;
}

export interface GuildWar {
  id: string;
  guildA: Guild;
  guildB: Guild;
  scoreA: number;
  scoreB: number;
  status: 'preparing' | 'active' | 'ended';
  startTime: number;
  endTime: number;
  participantsA: number;
  participantsB: number;
}

export interface GuildTask {
  id: string;
  guildId: string;
  type: 'build' | 'battle' | 'collect' | 'donate';
  description: string;
  target: number;
  progress: number;
  reward: number;
  expiresAt: number;
  contributors: { userId: string; amount: number }[];
}

export interface GuildShopItem {
  id: string;
  name: string;
  type: 'nft' | 'item' | 'title' | 'skin';
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
  stock: number;
}

// ===============================
// Guild Store
// ===============================

function createGuildStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityGuild')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        myGuild: null,
        appliedGuilds: [],
        guilds: [],
        wars: [],
        tasks: [],
        applications: [],
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityGuild', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 创建公会
    create: (name: string, description: string, emblem: string) => {
      const newGuild: Guild = {
        id: `guild_${Date.now()}`,
        name,
        description,
        emblem,
        level: 1,
        exp: 0,
        members: [],
        foundedAt: Date.now(),
        isRecruiting: true,
        tags: [],
      };
      
      update(state => ({
        ...state,
        myGuild: newGuild,
      }));
      
      return newGuild;
    },
    
    // 加入公会
    join: (guildId: string) => {
      update(state => {
        const guild = state.guilds.find(g => g.id === guildId);
        if (!guild || guild.members.length >= GUILD_CONFIG.LEVELS[guild.level - 1].members) {
          throw new Error('公会已满!');
        }
        
        // 添加申请
        const application: GuildApplication = {
          id: `app_${Date.now()}`,
          guildId,
          userId: 'current_user',
          message: '',
          appliedAt: Date.now(),
        };
        
        return {
          ...state,
          applications: [...state.applications, application],
        };
      });
    },
    
    // 批准加入
    approveApplication: (applicationId: string) => {
      update(state => {
        const app = state.applications.find(a => a.id === applicationId);
        if (!app) return state;
        
        const guild = state.guilds.find(g => g.id === app.guildId);
        if (!guild) return state;
        
        // 添加成员
        const newMember: GuildMember = {
          userId: app.userId,
          name: 'Player',
          avatar: '👤',
          role: 'recruit',
          contribution: 0,
          joinedAt: Date.now(),
          lastActive: Date.now(),
        };
        
        guild.members.push(newMember);
        
        return {
          ...state,
          applications: state.applications.filter(a => a.id !== applicationId),
        };
      });
    },
    
    // 离开公会
    leave: () => {
      update(state => ({
        ...state,
        myGuild: null,
      }));
    },
    
    // 添加经验
    addExp: (amount: number) => {
      update(state => {
        if (!state.myGuild) return state;
        
        state.myGuild.exp += amount;
        
        // 检查升级
        const config = GUILD_CONFIG.LEVELS.find(
          (l, i) => state.myGuild!.exp >= l.exp && 
          (!GUILD_CONFIG.LEVELS[i + 1] || state.myGuild!.exp < GUILD_CONFIG.LEVELS[i + 1].exp)
        );
        
        if (config && state.myGuild.level < config.level) {
          state.myGuild.level = config.level;
        }
        
        return state;
      });
    },
    
    // 贡献资源
    contribute: (userId: string, amount: number) => {
      update(state => {
        if (!state.myGuild) return state;
        
        const member = state.myGuild.members.find(m => m.userId === userId);
        if (member) {
          member.contribution += amount;
        }
        
        state.myGuild.exp += Math.floor(amount / 10); // 10%转为公会经验
        
        return state;
      });
    },
    
    // 发起公会战
    declareWar: (targetGuildId: string) => {
      const war: GuildWar = {
        id: `war_${Date.now()}`,
        guildA: null as any,
        guildB: null as any,
        scoreA: 0,
        scoreB: 0,
        status: 'preparing',
        startTime: Date.now() + 3600000, // 1小时后开始
        endTime: Date.now() + 7200000, // 2小时后结束
        participantsA: 0,
        participantsB: 0,
      };
      
      update(state => ({
        ...state,
        wars: [...state.wars, war],
      }));
      
      return war;
    },
    
    // 创建公会任务
    createTask: (type: GuildTask['type'], description: string, target: number, reward: number) => {
      const task: GuildTask = {
        id: `task_${Date.now()}`,
        guildId: 'my_guild',
        type,
        description,
        target,
        progress: 0,
        reward,
        expiresAt: Date.now() + 86400000, // 24小时
        contributors: [],
      };
      
      update(state => ({
        ...state,
        tasks: [...state.tasks, task],
      }));
      
      return task;
    },
    
    // 重置
    reset: () => {
      set({
        myGuild: null,
        appliedGuilds: [],
        guilds: [],
        wars: [],
        tasks: [],
        applications: [],
      });
    },
  };
}

export const guild = createGuildStore();

// ===============================
// Derived Stores
// ===============================

export const myGuild = derived(guild, $guild => $guild.myGuild);

export const guildStats = derived(guild, $guild => {
  if (!$guild.myGuild) {
    return null;
  }
  
  const g = $guild.myGuild;
  const config = GUILD_CONFIG.LEVELS[g.level - 1];
  
  return {
    name: g.name,
    level: g.level,
    exp: g.exp,
    expToNext: config.exp > g.exp ? config.exp : GUILD_CONFIG.LEVELS[g.level]?.exp || 'MAX',
    memberCount: g.members.length,
    maxMembers: config.members,
    isRecruiting: g.isRecruiting,
    totalContribution: g.members.reduce((sum, m) => sum + m.contribution, 0),
  };
});

// ===============================
// Helper Functions
// ===============================

export function canCreateGuild(requiredLevel: number = GUILD_CONFIG.MIN_LEVEL_TO_CREATE): boolean {
  return true; // TODO: check user level
}

export function getGuildLevelInfo(level: number) {
  return GUILD_CONFIG.LEVELS[level - 1] || GUILD_CONFIG.LEVELS[GUILD_CONFIG.LEVELS.length - 1];
}

export function formatContribution(contribution: number): string {
  if (contribution >= 1000000) {
    return `${(contribution / 1000000).toFixed(1)}M`;
  }
  if (contribution >= 1000) {
    return `${(contribution / 1000).toFixed(1)}K`;
  }
  return contribution.toString();
}

// ===============================
// Guild Shop
// ===============================

export const GUILD_SHOP: GuildShopItem[] = [
  { id: 'guild_nft_001', name: '公会徽章NFT', type: 'nft', price: 500, rarity: 'rare', effect: '+10% 公会贡献', stock: 10 },
  { id: 'guild_title_001', name: '荣誉成员称号', type: 'title', price: 200, rarity: 'common', effect: '专属称号', stock: 50 },
  { id: 'guild_skin_001', name: '公会专属皮肤', type: 'skin', price: 1000, rarity: 'epic', effect: '全皮肤解锁', stock: 5 },
  { id: 'guild_nerf_001', name: '战斗buff(24h)', type: 'item', price: 100, rarity: 'common', effect: '+20% 战斗奖励', stock: 100 },
];

// ===============================
// Default Export
// ===============================

export default {
  guild,
  myGuild,
  guildStats,
  GUILD_CONFIG,
  GUILD_SHOP,
  canCreateGuild,
  getGuildLevelInfo,
};
