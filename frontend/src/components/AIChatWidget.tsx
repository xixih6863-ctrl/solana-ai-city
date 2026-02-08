/**
 * Solana AI City - AI Chat Widget Component
 * AI聊天小部件
 */

import { ai, aiStats, AI_CONFIG } from '../services/aiAssistant';

export default function AIChatWidget() {
  return {
    // Bot info
    botName: AI_CONFIG.NAME,
    botAvatar: AI_CONFIG.AVATAR,
    
    // Stats
    stats: aiStats,
    
    // Actions
    toggleChat: () => {
      // Open/close chat
    },
    
    sendMessage: (text: string) => {
      // Send message to AI
      return ai.userInput(text);
    },
    
    getSuggestions: () => {
      // Get smart suggestions
      return ai.pendingSuggestions || [];
    },
    
    completeTutorial: (tutorialId: string) => {
      // Complete tutorial step
    },
    
    // Messages
    messages: () => {
      return ai.messages || [];
    },
    
    unreadCount: () => {
      return ai.stats?.unreadMessages || 0;
    },
  };
}
