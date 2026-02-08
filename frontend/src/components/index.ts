/**
 * Solana AI City - All UI Components Index
 * 完整UI组件索引
 */

// ===============================
// Core UI Components
// ===============================

export { default as ResourcePanel } from './ResourcePanel';
export { default as GachaComponents } from './GachaComponents';

// ===============================
// Guild UI Components
// ===============================

export { default as GuildPanel } from './GuildPanel';
export { default as GuildWarUI } from './GuildWarUI';
export { default as GuildMemberList } from './GuildMemberList';
export { default as GuildShopUI } from './GuildShopUI';

// ===============================
// Arena UI Components
// ===============================

export { default as ArenaLobby } from './ArenaLobby';
export { default as ArenaBattle } from './ArenaBattle';
export { default as ArenaLeaderboard } from './ArenaLeaderboard';
export { default as ArenaMatchmaking } from './ArenaMatchmaking';

// ===============================
// Quest UI Components
// ===============================

export { default as QuestPanel } from './QuestPanel';
export { default as DailyQuests } from './DailyQuests';
export { default as WeeklyQuests } from './WeeklyQuests';
export { default as AchievementPanel } from './AchievementPanel';
export { default as QuestRewards } from './QuestRewards';

// ===============================
// Market UI Components
// ===============================

export { default as Marketplace } from './Marketplace';
export { default as NFTListing } from './NFTListing';
export { default as AuctionPanel } from './AuctionPanel';
export { default as CurrencyExchange } from './CurrencyExchange';
export { default as OrderBook } from './OrderBook';

// ===============================
// Leaderboard UI Components
// ===============================

export { default as LeaderboardPanel } from './LeaderboardPanel';
export { default as SeasonRanking } from './SeasonRanking';
export { default as RankBadge } from './RankBadge';
export { default as SeasonProgress } from './SeasonProgress';

// ===============================
// Social UI Components
// ===============================

export { default as FriendList } from './FriendList';
export { default as ChatPanel } from './ChatPanel';
export { default as FriendRequests } from './FriendRequests';
export { default as InvitePanel } from './InvitePanel';
export { default as OnlineStatus } from './OnlineStatus';

// ===============================
// AI Assistant UI Components
// ===============================

export { default as AIChatWidget } from './AIChatWidget';
export { default as AISuggestions } from './AISuggestions';
export { default as AITutorial } from './AITutorial';
export { default as AINotifications } from './AINotifications';
export { default as CityBotAvatar } from './CityBotAvatar';

// ===============================
// Events UI Components
// ===============================

export { default as EventCalendar } from './EventCalendar';
export { default as LoginBonus } from './LoginBonus';
export { default as ActiveEvents } from './ActiveEvents';
export { default as HolidayBanner } from './HolidayBanner';
export { default as EventRewards } from './EventRewards';

// ===============================
// Component Usage Examples
// ===============================

/*
// Main App Integration
import { 
  ResourcePanel, 
  QuestPanel, 
  ArenaLobby,
  Marketplace,
  LeaderboardPanel,
  FriendList,
  AIChatWidget,
  LoginBonus 
} from './components';

function App() {
  return (
    <div className="app">
      <ResourcePanel />
      <QuestPanel />
      <ArenaLobby />
      <Marketplace />
      <LeaderboardPanel />
      <FriendList />
      <AIChatWidget />
      <LoginBonus />
    </div>
  );
}

// Modal/Page Navigation
function openGuild() {
  showModal(<GuildPanel />);
}

function openArena() {
  navigate('/arena', <ArenaLobby />);
}

function openMarket() {
  navigate('/market', <Marketplace />);
}
*/

// ===============================
// UI Design System
// ===============================

export const UI_THEME = {
  colors: {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-blue-500 to-cyan-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-rose-500',
    gold: 'from-yellow-400 to-yellow-600',
    energy: 'from-orange-400 to-red-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
    mythic: 'from-pink-500 to-red-500',
  },
  
  gradients: {
    card: 'bg-gradient-to-br from-white/10 to-white/5',
    button: 'bg-gradient-to-r from-purple-500 to-pink-500',
    header: 'bg-gradient-to-r from-purple-600 to-pink-600',
  },
  
  spacing: {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  
  rounded: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
};

// ===============================
// Common Icons
// ===============================

export const UI_ICONS = {
  energy: '⚡',
  gold: '🪙',
  usdc: '💎',
  reputation: '🏆',
  quest: '📋',
  battle: '⚔️',
  guild: '🏰',
  market: '🛒',
  social: '👥',
  ai: '🤖',
  event: '🎉',
  settings: '⚙️',
  close: '✕',
  back: '←',
  forward: '→',
  expand: '⤢',
  collapse: '⤡',
};

// ===============================
// Animation Presets
// ===============================

export const UI_ANIMATIONS = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  shake: 'animate-shake',
  glow: 'animate-glow',
};

export const ANIMATION_DURATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
};

// ===============================
// Export All
// ===============================

export default {
  // Core
  ResourcePanel,
  GachaComponents,
  
  // Guild
  GuildPanel,
  GuildWarUI,
  GuildMemberList,
  GuildShopUI,
  
  // Arena
  ArenaLobby,
  ArenaBattle,
  ArenaLeaderboard,
  ArenaMatchmaking,
  
  // Quest
  QuestPanel,
  DailyQuests,
  WeeklyQuests,
  AchievementPanel,
  QuestRewards,
  
  // Market
  Marketplace,
  NFTListing,
  AuctionPanel,
  CurrencyExchange,
  OrderBook,
  
  // Leaderboard
  LeaderboardPanel,
  SeasonRanking,
  RankBadge,
  SeasonProgress,
  
  // Social
  FriendList,
  ChatPanel,
  FriendRequests,
  InvitePanel,
  OnlineStatus,
  
  // AI
  AIChatWidget,
  AISuggestions,
  AITutorial,
  AINotifications,
  CityBotAvatar,
  
  // Events
  EventCalendar,
  LoginBonus,
  ActiveEvents,
  HolidayBanner,
  EventRewards,
  
  // System
  UI_THEME,
  UI_ICONS,
  UI_ANIMATIONS,
};
