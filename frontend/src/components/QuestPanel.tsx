/**
 * Solana AI City - Quest Panel Component
 * 任务面板组件
 */

import { quest, questStats, dailyQuestProgress, weeklyQuestProgress, QUEST_CONFIG } from '../services/quest';

export default function QuestPanel() {
  return {
    // Tab navigation
    tabs: ['daily', 'weekly', 'achievements'],
    activeTab: 'daily',
    
    // Stats display
    stats: questStats,
    
    // Progress bars
    dailyProgress: dailyQuestProgress,
    weeklyProgress: weeklyQuestProgress,
    
    // Actions
    claimDailyReward: () => {
      // Claim completed daily quests
    },
    
    claimWeeklyReward: () => {
      // Claim completed weekly quests
    },
    
    refreshDaily: () => {
      // Refresh daily quests (costs 10 USDC)
    },
    
    viewAchievements: () => {
      // Show achievement gallery
    },
    
    // Quest lists
    dailyQuests: () => {
      return quest.dailyQuests || [];
    },
    
    weeklyQuests: () => {
      return quest.weeklyQuests || [];
    },
    
    achievements: () => {
      return quest.achievements || [];
    },
  };
}
