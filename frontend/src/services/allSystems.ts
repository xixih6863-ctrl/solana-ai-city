/**
 * Solana AI City - All Game Systems Index
 * 完整游戏系统索引
 */

// ===============================
// Core Economy Systems
// ===============================

export { 
  energy, 
  energyPercentage, 
  ACTION_ENERGY_COST,
  ENERGY_CONFIG 
} from './energy';

export { 
  gold, 
  goldFormatted, 
  GOLD_CONFIG,
  canAffordGold,
  getBuildingCost 
} from './gold';

export { 
  usdc, 
  usdcFormatted, 
  USDC_CONFIG,
  canAffordUSDC,
  getDailyStakingYield 
} from './usdc';

export { 
  reputation, 
  reputationProgress, 
  REPUTATION_CONFIG,
  calculateLevelInfo 
} from './reputation';

// ===============================
// Gacha/Lottery System
// ===============================

export { 
  lottery, 
  lotteryStats, 
  LOTTERY_CONFIG,
  LOOT_TABLE,
  getBoxInfo,
  formatRarity,
  type Rarity,
  type LootItem 
} from './lottery';

// ===============================
// Guild System (Coming Soon)
// ===============================

export {
  // Guild creation, membership, wars, tasks, shop, leaderboard
  // Import from guild.ts after completion
} from './guild';

// ===============================
// PvP Arena System (Coming Soon)
// ===============================

export {
  // Battle system, ranking, seasons, matchmaking
  // Import from arena.ts after completion
} from './arena';

// ===============================
// Quest System (Coming Soon)
// ===============================

export {
  // Daily quests, weekly quests, achievements, rewards
  // Import from quest.ts after completion
} from './quest';

// ===============================
// Marketplace System (Coming Soon)
// ===============================

export {
  // NFT trading, currency exchange, auctions
  // Import from market.ts after completion
} from './market';

// ===============================
// Leaderboard System (Coming Soon)
// ===============================

export {
  // Rankings for reputation, gold, guilds, seasons
  // Import from leaderboard.ts after completion
} from './leaderboard';

// ===============================
// Social System (Coming Soon)
// ===============================

export {
  // Friends, chat, invites, sharing
  // Import from social.ts after completion
} from './social';

// ===============================
// AI Assistant (Coming Soon)
// ===============================

export {
  // Recommendations, strategy hints, tutorials
  // Import from aiAssistant.ts after completion
} from './aiAssistant';

// ===============================
// Events System (Coming Soon)
// ===============================

export {
  // Holiday events, limited quests, login bonuses
  // Import from events.ts after completion
} from './events';

// ===============================
// Combined Resource Panel
// ===============================

/*
import { 
  energy, gold, usdc, reputation, 
  lottery, guild, arena, quest,
  market, leaderboard, social, events 
} from './services';

function GameUI() {
  return (
    <div className="game">
      <ResourcePanel />
      <QuestTracker />
      <ArenaButton />
      <GuildButton />
      <MarketButton />
      <SocialButton />
      <AIAssistant />
      <EventBanner />
    </div>
  );
}
*/

// ===============================
// System Status
// ===============================

export const SYSTEM_STATUS = {
  economy: {
    energy: '✅ Done',
    gold: '✅ Done',
    usdc: '✅ Done',
    reputation: '✅ Done',
  },
  gacha: {
    lottery: '✅ Done',
    pity: '✅ Done',
    inventory: '✅ Done',
  },
  social: {
    guild: '⏳ In Progress',
    arena: '⏳ In Progress',
    quest: '⏳ In Progress',
    market: '⏳ In Progress',
    leaderboard: '⏳ In Progress',
    social: '⏳ In Progress',
    aiAssistant: '⏳ In Progress',
    events: '⏳ In Progress',
  },
};

export const COMPLETION_PROGRESS = {
  completed: 5,
  total: 13,
  percent: 38,
};

// ===============================
// Quick Access Functions
// ===============================

export function getResourceStatus() {
  return {
    energy: energy.current,
    gold: gold.current,
    usdc: usdc.balance,
    reputation: reputation.current,
    level: reputation.level,
  };
}

export function checkAccess(requiredLevel: number): boolean {
  return reputation.level >= requiredLevel;
}

export function canAccessFeature(feature: string, requiredLevel: number): boolean {
  return checkAccess(requiredLevel);
}
