/**
 * Solana AI City - Complete All Services Export
 * 完整服务导出
 */

// Core Economy
export * from './energy';
export * from './gold';
export * from './usdc';
export * from './reputation';

// Gacha/Lottery
export * from './lottery';

// Guild System
export {
  guild,
  myGuild,
  guildStats,
  GUILD_CONFIG,
  GUILD_SHOP,
  canCreateGuild,
  getGuildLevelInfo,
} from './guild';

// PvP Arena
export {
  arena,
  arenaStats,
  arenaRankName,
  ARENA_CONFIG,
  BATTLE_ANIMATIONS,
  calculateEloGain,
  calculateRank,
} from './arena';

// Quest System
export {
  quest,
  questStats,
  dailyQuestProgress,
  weeklyQuestProgress,
  QUEST_CONFIG,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  ACHIEVEMENT_TEMPLATES,
} from './quest';

// Marketplace
export {
  market,
  marketStats,
  exchangeRate,
  MARKET_CONFIG,
  formatPrice,
  calculateFees,
  getTimeRemaining,
  getRarityColor,
} from './market';

// Leaderboard
export {
  leaderboard,
  currentSeason,
  seasonProgress,
  myLeaderboardStats,
  LEADERBOARD_CONFIG,
  getRankBadge,
  getRankTitle,
  getRankChange,
  formatValue,
} from './leaderboard';

// Social
export {
  social,
  socialStats,
  onlineFriends,
  SOCIAL_CONFIG,
  getStatusColor,
  getStatusText,
  formatLastActive,
  generateShareText,
} from './social';

// AI Assistant
export {
  ai,
  aiStats,
  unreadMessages,
  pendingSuggestions,
  AI_CONFIG,
  generateResponse,
  generateSmartRecommendations,
} from './aiAssistant';

// Events
export {
  events,
  eventStats,
  activeEvents,
  upcomingEvents,
  EVENTS_CONFIG,
  EVENT_TEMPLATES,
  canClaimLoginBonus,
  generateEventCalendar,
} from './events';

// All Systems Combined
export {
  SYSTEM_STATUS,
  COMPLETION_PROGRESS,
  getResourceStatus,
  checkAccess,
  canAccessFeature,
} from './allSystems';

// ===============================
// Quick Access Functions
// ===============================

export function getAllStats() {
  return {
    economy: {
      energy: 0, // 从energy store获取
      gold: 0,
      usdc: 0,
      reputation: 0,
      level: 1,
    },
    quest: {
      dailyProgress: 0,
      weeklyProgress: 0,
      achievements: 0,
    },
    arena: {
      elo: 1000,
      rank: 10000,
      winRate: '0%',
    },
    social: {
      friends: 0,
      online: 0,
    },
    events: {
      activeCount: 0,
      loginStreak: 0,
    },
  };
}

export function quickActions() {
  return [
    { id: 'daily_quests', label: '📋 每日任务', action: 'open_daily_quests' },
    { id: 'arena', label: '⚔️ 进入竞技场', action: 'open_arena' },
    { id: 'guild', label: '🏰 公会', action: 'open_guild' },
    { id: 'market', label: '🛒 市场', action: 'open_market' },
    { id: 'lottery', label: '🎰 抽奖', action: 'open_lottery' },
    { id: 'leaderboard', label: '🏆 排行榜', action: 'open_leaderboard' },
    { id: 'friends', label: '👥 好友', action: 'open_friends' },
    { id: 'events', label: '🎉 活动', action: 'open_events' },
  ];
}

// ===============================
// Export Complete
// ===============================

export default {
  // Core
  ...require('./energy'),
  ...require('./gold'),
  ...require('./usdc'),
  ...require('./reputation'),
  ...require('./lottery'),
  
  // Features
  ...require('./guild'),
  ...require('./arena'),
  ...require('./quest'),
  ...require('./market'),
  ...require('./leaderboard'),
  ...require('./social'),
  ...require('./aiAssistant'),
  ...require('./events'),
  
  // Combined
  ...require('./allSystems'),
};
