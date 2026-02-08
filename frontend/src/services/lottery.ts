/**
 * Solana AI City - Lottery/Gacha System
 * 抽奖/盲盒系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const LOTTERY_CONFIG = {
  // 免费抽奖配置
  FREE_DAILY: {
    ENABLED: true,
    COOLDOWN_HOURS: 24,
    FREE_COUNT: 1,
  },
  
  // 奖池价格
  BOX_PRICES: {
    common: { usdc: 10, gold: 1000 },
    rare: { usdc: 50, gold: 5000 },
    epic: { usdc: 200, gold: 20000 },
    legendary: { usdc: 500, gold: 50000 },
    mythic: { usdc: 1000, gold: 100000 },
  },
  
  // 稀有度概率 (万分比)
  PROBABILITIES: {
    common: {
      mythic: 1,      // 0.01%
      legendary: 49,  // 0.49%
      epic: 500,      // 5%
      rare: 2000,     // 20%
      common: 7450,   // 74.5%
    },
    rare: {
      mythic: 5,      // 0.05%
      legendary: 95,   // 0.95%
      epic: 900,      // 9%
      rare: 4000,     // 40%
      common: 5000,   // 50%
    },
    epic: {
      mythic: 20,     // 0.2%
      legendary: 180,  // 1.8%
      epic: 2800,     // 28%
      rare: 5000,     // 50%
      common: 2000,   // 20%
    },
    legendary: {
      mythic: 50,     // 0.5%
      legendary: 450,  // 4.5%
      epic: 3000,     // 30%
      rare: 4500,     // 45%
      common: 2000,    // 20%
    },
    mythic: {
      mythic: 200,    // 2%
      legendary: 800,  // 8%
      epic: 3000,     // 30%
      rare: 4000,     // 40%
      common: 2000,   // 20%
    },
  },
  
  // 保底机制
  PITY_SYSTEM: {
    MYTHIC_PITY: 500,     // 500次必中神话
    LEGENDARY_PITY: 100,   // 100次必中传说
  },
  
  // 每日免费次数
  FREE_DAILY_COUNT: 1,
};

// ===============================
// Types
// ===============================

export type Rarity = 'mythic' | 'legendary' | 'epic' | 'rare' | 'common';

export interface LootItem {
  id: string;
  name: string;
  rarity: Rarity;
  type: 'nft' | 'item' | 'currency' | 'consumable';
  value: number;
  description: string;
  image?: string;
}

export interface LootBox {
  id: string;
  name: string;
  type: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  price: number;
  items: LootItem[];
  probabilities: Record<Rarity, number>;
}

export interface LotteryState {
  freeDrawsRemaining: number;
  lastFreeDrawTime: number;
  totalDraws: number;
  pityCounterMythic: number;
  pityCounterLegendary: number;
  inventory: InventoryItem[];
  history: DrawHistory[];
}

interface InventoryItem {
  itemId: string;
  quantity: number;
  obtainedAt: number;
}

interface DrawHistory {
  item: LootItem;
  boxType: string;
  timestamp: number;
  isDupe: boolean;
}

// ===============================
// Loot Tables
// ===============================

export const LOOT_TABLE: Record<Rarity, LootItem[]> = {
  mythic: [
    { id: 'mythic_001', name: '创世神龙', rarity: 'mythic', type: 'nft', value: 10000, description: '传说中的创世级NFT' },
    { id: 'mythic_002', name: '永恒之城', rarity: 'mythic', type: 'nft', value: 8000, description: '永恒的城池NFT' },
    { id: 'mythic_003', name: '时间王者', rarity: 'mythic', type: 'nft', value: 8000, description: '掌控时间的王者' },
    { id: 'mythic_004', name: '宇宙之心', rarity: 'mythic', type: 'nft', value: 10000, description: '宇宙核心的力量' },
    { id: 'mythic_005', name: '神话称号', rarity: 'mythic', type: 'item', value: 5000, description: '佩戴后+100%所有属性' },
  ],
  legendary: [
    { id: 'legendary_001', name: '龙骑士', rarity: 'legendary', type: 'nft', value: 2000, description: '强大的龙骑士NFT' },
    { id: 'legendary_002', name: '黄金城', rarity: 'legendary', type: 'nft', value: 1500, description: '黄金铸造的城市' },
    { id: 'legendary_003', name: '传说称号', rarity: 'legendary', type: 'item', value: 1000, description: '佩戴后+50%所有属性' },
    { id: 'legendary_004', name: '传奇装备', rarity: 'legendary', type: 'item', value: 800, description: '传奇级武器' },
    { id: 'legendary_005', name: '公会令牌', rarity: 'legendary', type: 'item', value: 500, description: '创建公会必备' },
  ],
  epic: [
    { id: 'epic_001', name: '精灵弓箭手', rarity: 'epic', type: 'nft', value: 300, description: '精准的弓箭手' },
    { id: 'epic_002', name: '魔法塔', rarity: 'epic', type: 'nft', value: 250, description: '产生魔法能量' },
    { id: 'epic_003', name: '史诗称号', rarity: 'epic', type: 'item', value: 200, description: '佩戴后+30%属性' },
    { id: 'epic_004', name: '稀有材料', rarity: 'epic', type: 'consumable', value: 100, description: '升级材料' },
    { id: 'epic_005', name: '能量药剂', rarity: 'epic', type: 'consumable', value: 50, description: '恢复50能量' },
  ],
  rare: [
    { id: 'rare_001', name: '精锐士兵', rarity: 'rare', type: 'nft', value: 50, description: '基础战斗单位' },
    { id: 'rare_002', name: '坚固城墙', rarity: 'rare', type: 'nft', value: 40, description: '基础防御建筑' },
    { id: 'rare_003', name: '稀有称号', rarity: 'rare', type: 'item', value: 30, description: '佩戴后+10%属性' },
    { id: 'rare_004', name: '金币袋', rarity: 'rare', type: 'currency', value: 100, description: '1000金币' },
    { id: 'rare_005', name: '经验书', rarity: 'rare', type: 'consumable', value: 25, description: '500经验' },
  ],
  common: [
    { id: 'common_001', name: '普通市民', rarity: 'common', type: 'nft', value: 5, description: '基础NFT' },
    { id: 'common_002', name: '小木屋', rarity: 'common', type: 'nft', value: 3, description: '基础建筑' },
    { id: 'common_003', name: '普通材料', rarity: 'common', type: 'consumable', value: 2, description: '建筑材料' },
    { id: 'common_004', name: '金币', rarity: 'common', type: 'currency', value: 10, description: '100金币' },
    { id: 'common_005', name: '体力药剂', rarity: 'common', type: 'consumable', value: 5, description: '恢复10能量' },
  ],
};

// ===============================
// Store
// ===============================

function createLotteryStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityLottery')
    : null;
  
  const initialState: LotteryState = stored 
    ? JSON.parse(stored)
    : {
        freeDrawsRemaining: LOTTERY_CONFIG.FREE_DAILY_COUNT,
        lastFreeDrawTime: 0,
        totalDraws: 0,
        pityCounterMythic: 0,
        pityCounterLegendary: 0,
        inventory: [],
        history: [],
      };
  
  const { subscribe, set, update } = writable<LotteryState>(initialState);
  
  // 自动保存
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityLottery', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 重置每日免费次数
    resetDaily: () => {
      update(state => ({
        ...state,
        freeDrawsRemaining: LOTTERY_CONFIG.FREE_DAILY_COUNT,
        lastFreeDrawTime: Date.now(),
      }));
    },
    
    // 免费抽奖
    freeDraw: () => {
      let result: { item: LootItem; isDupe: boolean } | null = null;
      
      update(state => {
        if (state.freeDrawsRemaining <= 0) {
          return state;
        }
        
        const item = rollItem('common', state.pityCounterMythic, state.pityCounterLegendary);
        const isDupe = state.inventory.some(i => i.itemId === item.id);
        
        result = { item, isDupe };
        
        // 更新状态
        const newPityMythic = item.rarity === 'mythic' ? 0 : state.pityCounterMythic + 1;
        const newPityLegendary = item.rarity === 'legendary' ? 0 : state.pityCounterLegendary + 1;
        
        return {
          ...state,
          freeDrawsRemaining: state.freeDrawsRemaining - 1,
          totalDraws: state.totalDraws + 1,
          pityCounterMythic: newPityMythic,
          pityCounterLegendary: newPityLegendary,
          inventory: addToInventory(state.inventory, item),
          history: [{
            item,
            boxType: 'free_daily',
            timestamp: Date.now(),
            isDupe,
          }, ...state.history.slice(0, 49)],
        };
      });
      
      return result;
    },
    
    // 付费抽奖
    paidDraw: (boxType: keyof typeof LOTTERY_CONFIG.BOX_PRICES) => {
      const price = LOTTERY_CONFIG.BOX_PRICES[boxType].usdc;
      let result: { item: LootItem; isDupe: boolean; newPityMythic: number; newPityLegendary: number } | null = null;
      
      update(state => {
        const item = rollItem(boxType, state.pityCounterMythic, state.pityCounterLegendary);
        const isDupe = state.inventory.some(i => i.itemId === item.id);
        
        result = { item, isDupe, newPityMythic: 0, newPityLegendary: 0 };
        
        // 应用保底
        let newPityMythic = state.pityCounterMythic;
        let newPityLegendary = state.pityCounterLegendary;
        
        if (item.rarity === 'mythic') {
          newPityMythic = 0;
        } else if (newPityMythic >= LOTTERY_CONFIG.PITY_SYSTEM.MYTHIC_PITY) {
          // 保底触发
          const mythicItems = LOOT_TABLE.mythic;
          result.item = mythicItems[Math.floor(Math.random() * mythicItems.length)];
          newPityMythic = 0;
        }
        
        if (item.rarity === 'legendary') {
          newPityLegendary = 0;
        } else if (newPityLegendary >= LOTTERY_CONFIG.PITY_SYSTEM.LEGENDARY_PITY) {
          const legendaryItems = LOOT_TABLE.legendary;
          result.item = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
          newPityLegendary = 0;
        }
        
        if (item.rarity === 'mythic') newPityMythic = 0;
        if (item.rarity === 'legendary') newPityLegendary = 0;
        
        return {
          ...state,
          totalDraws: state.totalDraws + 1,
          pityCounterMythic: newPityMythic,
          pityCounterLegendary: newPityLegendary,
          inventory: addToInventory(state.inventory, item),
          history: [{
            item,
            boxType,
            timestamp: Date.now(),
            isDupe,
          }, ...state.history.slice(0, 49)],
        };
      });
      
      return { result, price };
    },
    
    // 添加物品到背包
    addItem: (item: LootItem, quantity: number = 1) => {
      update(state => ({
        ...state,
        inventory: addToInventory(state.inventory, item, quantity),
      }));
    },
    
    // 使用物品
    useItem: (itemId: string, quantity: number = 1): boolean => {
      let success = false;
      update(state => {
        const idx = state.inventory.findIndex(i => i.itemId === itemId);
        if (idx !== -1 && state.inventory[idx].quantity >= quantity) {
          state.inventory[idx].quantity -= quantity;
          if (state.inventory[idx].quantity <= 0) {
            state.inventory.splice(idx, 1);
          }
          success = true;
        }
        return state;
      });
      return success;
    },
    
    // 重置
    reset: () => {
      set({
        freeDrawsRemaining: LOTTERY_CONFIG.FREE_DAILY_COUNT,
        lastFreeDrawTime: 0,
        totalDraws: 0,
        pityCounterMythic: 0,
        pityCounterLegendary: 0,
        inventory: [],
        history: [],
      });
    },
  };
}

export const lottery = createLotteryStore();

// ===============================
// Derived Stores
// ===============================

export const lotteryStats = derived(lottery, $lottery => ({
  totalDraws: $lottery.totalDraws,
  freeRemaining: $lottery.freeDrawsRemaining,
  pityMythic: $lottery.pityCounterMythic,
  pityLegendary: $lottery.pityCounterLegendry,
  itemsOwned: $lottery.inventory.length,
}));

export const canFreeDraw = derived(lottery, $lottery => {
  const hoursSinceLast = (Date.now() - $lottery.lastFreeDrawTime) / (1000 * 60 * 60);
  return hoursSinceLast >= LOTTERY_CONFIG.FREE_DAILY.COOLDOWN_HOURS || $lottery.freeDrawsRemaining > 0;
});

// ===============================
// Helper Functions
// ===============================

function addToInventory(inventory: InventoryItem[], item: LootItem, quantity: number = 1): InventoryItem[] {
  const existing = inventory.find(i => i.itemId === item.id);
  if (existing) {
    existing.quantity += quantity;
    return [...inventory];
  }
  return [...inventory, { itemId: item.id, quantity, obtainedAt: Date.now() }];
}

function rollItem(
  boxType: keyof typeof LOTTERY_CONFIG.PROBABILITIES,
  pityMythic: number,
  pityLegendary: number
): LootItem {
  const probabilities = LOTTERY_CONFIG.PROBABILITIES[boxType];
  
  // 应用保底
  let roll = Math.random() * 10000;
  
  if (pityMythic >= LOTTERY_CONFIG.PITY_SYSTEM.MYTHIC_PITY) {
    // 必中神话
    const mythicItems = LOOT_TABLE.mythic;
    return mythicItems[Math.floor(Math.random() * mythicItems.length)];
  }
  
  if (pityLegendary >= LOTTERY_CONFIG.PITY_SYSTEM.LEGENDARY_PITY) {
    // 必中传说及以上
    const items = [...LOOT_TABLE.mythic, ...LOOT_TABLE.legendary];
    return items[Math.floor(Math.random() * items.length)];
  }
  
  // 计算稀有度
  let rarity: Rarity = 'common';
  let cumulative = 0;
  
  const sortedProbabilities = [
    { rarity: 'mythic' as Rarity, prob: probabilities.mythic },
    { rarity: 'legendary' as Rarity, prob: probabilities.legendary },
    { rarity: 'epic' as Rarity, prob: probabilities.epic },
    { rarity: 'rare' as Rarity, prob: probabilities.rare },
    { rarity: 'common' as Rarity, prob: probabilities.common },
  ].sort((a, b) => a.prob - b.prob);
  
  for (const { rarity: r, prob } of sortedProbabilities) {
    cumulative += prob;
    if (roll < cumulative) {
      rarity = r;
      break;
    }
  }
  
  // 随机选择物品
  const items = LOOT_TABLE[rarity];
  return items[Math.floor(Math.random() * items.length)];
}

// ===============================
// Box Information
// ===============================

export function getBoxInfo(type: keyof typeof LOTTERY_CONFIG.BOX_PRICES) {
  const config = LOTTERY_CONFIG.BOX_PRICES[type];
  const probs = LOTTERY_CONFIG.PROBABILITIES[type];
  
  return {
    type,
    name: type.charAt(0).toUpperCase() + type.slice(1) + ' Box',
    price: config.usdc,
    priceGold: config.gold,
    probabilities: probs,
    expectedValue: calculateExpectedValue(type),
  };
}

export function calculateExpectedValue(boxType: keyof typeof LOTTERY_CONFIG.PROBABILITIES): number {
  const probs = LOTTERY_CONFIG.PROBABILITIES[boxType];
  let expectedValue = 0;
  
  for (const [rarity, prob] of Object.entries(probs)) {
    const items = LOOT_TABLE[rarity as Rarity];
    const avgValue = items.reduce((sum, item) => sum + item.value, 0) / items.length;
    expectedValue += (prob / 10000) * avgValue;
  }
  
  return expectedValue;
}

// ===============================
// Utility Functions
// ===============================

export function formatRarity(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    mythic: '🌟',
    legendary: '👑',
    epic: '💎',
    rare: '🔷',
    common: '⚪',
  };
  const names: Record<Rarity, string> = {
    mythic: '神话',
    legendary: '传说',
    epic: '史诗',
    rare: '稀有',
    common: '普通',
  };
  return `${colors[rarity]} ${names[rarity]}`;
}

export function getPityProgress(pity: number, max: number): number {
  return (pity / max) * 100;
}

// ===============================
// Export
// ===============================

export default {
  lottery,
  lotteryStats,
  canFreeDraw,
  LOTTERY_CONFIG,
  LOOT_TABLE,
  getBoxInfo,
  formatRarity,
  getPityProgress,
};
