/**
 * Solana AI City - Arena Lobby Component
 * 竞技场大厅组件
 */

import { arena, arenaStats, arenaRankName, ARENA_CONFIG } from '../services/arena';

export default function ArenaLobby() {
  return {
    // Quick stats
    stats: arenaStats,
    rankName: arenaRankName,
    
    // Actions
    enterArena: () => {
      // Start matchmaking
    },
    
    viewLeaderboard: () => {
      // Show arena rankings
    },
    
    checkSeasonRewards: () => {
      // Show season rewards
    },
    
    battleHistory: () => {
      // Show past battles
    },
    
    // Info displays
    seasonInfo: () => {
      return {
        daysRemaining: 15,
        topReward: '1000 USDC',
      };
    },
    
    matchmakingStatus: () => {
      return {
        inQueue: false,
        estimatedWait: '< 1 min',
      };
    },
  };
}
