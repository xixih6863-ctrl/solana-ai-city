// ============================================
// Solana AI City - Main Components Export
// ============================================

// Core Game Components
export { ResourcePanel } from './ResourcePanel';
export { BuildingMenu } from './BuildingMenu';
export { GameMap } from './GameMap';
export { PlayerProfile } from './PlayerProfile';
export { Leaderboard } from './Leaderboard';
export { SettingsPanel } from './SettingsPanel';
export { TutorialOverlay } from './TutorialOverlay';
export { AISuggestionPanel } from './AISuggestionPanel';

// Blockchain Components
export { WalletConnect } from './WalletConnect';
export { TokenGate } from './TokenGate';
export { AchievementNFT } from './AchievementNFT';
export { BlockchainPanel } from './BlockchainPanel';

// Social & Quest Components
export { ChatRoom, TradeOfferCard, NotificationCenter, FriendList, QuickChat } from './ChatSystem';
export { QuestPanel, QuestCard, QuestResetTimer } from './QuestSystem';

// Shop Components
export { ShopPanel, SubscriptionCard, DailyFreeRewards } from './ShopSystem';

// Layout Components
export { GameLayout } from './GameLayout';
export { Header } from './Header';
export { Footer } from './Footer';
export { Modal } from './Modal';
export { LoadingScreen } from './LoadingScreen';

// UI Components
export { Button, ButtonGroup } from './ui/Button';
export { Card } from './ui/Card';
export { Badge } from './ui/Badge';
export { ProgressBar } from './ui/ProgressBar';
export { Input, TextArea, Select } from './ui/Input';
export { Tooltip } from './ui/Tooltip';
export { Tab, Tabs } from './ui/Tabs';
export { Dropdown } from './ui/Dropdown';
export { Alert } from './ui/Alert';
export { Toast, ToastContainer, useToast } from './ui/Toast';
export { Spinner } from './ui/Spinner';
export { EmptyState } from './ui/EmptyState';
export { Avatar } from './ui/Avatar';
export { Icon } from './ui/Icon';

// ============================================
// Re-export Types
// ============================================

export type {
  GameResources,
  ResourceRates,
  BuildingType,
  Building,
  BuildingStats,
  Achievement,
  AchievementRarity,
  Player,
  PlayerStats,
  Quest,
  QuestStatus,
  ShopItem,
  ShopCategory,
  TradeOffer,
  ChatMessage,
  Notification,
  Friend,
} from '../types';

// ============================================
// Version Info
// ============================================

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

console.log(`🏙️ Solana AI City v${VERSION} loaded`);
console.log(`📦 ${process.env.VITE_APP_VERSION || 'Production Build'}`);
