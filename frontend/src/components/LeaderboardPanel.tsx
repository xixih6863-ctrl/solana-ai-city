/**
 * Solana AI City - Leaderboard Panel Component
 * 排行榜面板组件
 */

import { leaderboard, currentSeason, seasonProgress, LEADERBOARD_CONFIG } from '../services/leaderboard';

export default function LeaderboardPanel() {
  return {
    // Tab navigation
    tabs: ['reputation', 'gold', 'arena', 'guild', 'season'],
    activeTab: 'reputation',
    
    // Season info
    season: currentSeason,
    progress: seasonProgress,
    
    // Actions
    viewMyRank: () => {
      // Show user's rankings
    },
    
    filterByTime: (timeframe: string) => {
      // Filter by time (daily, weekly, all-time)
    },
    
    shareRank: () => {
      // Share rank on social media
    },
    
    // Leaderboards
    reputationList: () => {
      return leaderboard.reputation || [];
    },
    
    goldList: () => {
      return leaderboard.gold || [];
    },
    
    arenaList: () => {
      return leaderboard.arena || [];
    },
    
    guildList: () => {
      return leaderboard.guild || [];
    },
    
    seasonList: () => {
      return leaderboard.season || [];
    },
  };
}
