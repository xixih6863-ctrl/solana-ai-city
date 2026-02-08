/**
 * Solana AI City - AI Assistant System
 * AI助手系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const AI_CONFIG = {
  NAME: 'CityBot',
  AVATAR: '🤖',
  
  // 响应类型
  RESPONSE_TYPES: [
    'greeting',
    'tip',
    'strategy',
    'reminder',
    'celebration',
    'encouragement',
    'warning',
    'tutorial',
  ],
  
  // 建议间隔
  SUGGESTION_INTERVAL_MINUTES: 15,
  
  // 情绪
  MOODS: ['happy', 'helpful', 'excited', 'calm', 'encouraging'],
};

// ===============================
// Types
// ===============================

export type ResponseType = typeof AI_CONFIG.RESPONSE_TYPES[number];
export type Mood = typeof AI_CONFIG.MOODS[number];

export interface AIMessage {
  id: string;
  type: ResponseType;
  content: string;
  mood: Mood;
  timestamp: number;
  action?: {
    label: string;
    callback: string;
  };
  read: boolean;
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  type: 'build' | 'battle' | 'quest' | 'social' | 'economy';
  priority: 'high' | 'medium' | 'low';
  action: () => void;
}

export interface AITutorial {
  id: string;
  title: string;
  steps: TutorialStep[];
  completed: boolean;
}

export interface TutorialStep {
  title: string;
  content: string;
  targetElement?: string;
  completed: boolean;
}

// ===============================
// AI Store
// ===============================

function createAIStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityAI')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        messages: [],
        suggestions: [],
        tutorials: [
          {
            id: 'getting_started',
            title: '新手引导',
            steps: [
              { title: '欢迎', content: '欢迎来到 Solana AI City!', completed: true },
              { title: '建造', content: '点击建造按钮开始建设你的城市!', completed: false },
              { title: '战斗', content: '进入地牢挑战怪物获得奖励!', completed: false },
              { title: '社交', content: '添加好友一起游戏!', completed: false },
            ],
            completed: false,
          },
        ],
        mood: 'helpful' as Mood,
        settings: {
          enabled: true,
          showTips: true,
          showReminders: true,
          showCelebrations: true,
          autoSuggest: true,
        },
        lastInteraction: Date.now(),
        conversationHistory: [],
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityAI', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 发送消息
    sendMessage: (type: ResponseType, content: string, action?: AIMessage['action']) => {
      const message: AIMessage = {
        id: `ai_${Date.now()}`,
        type,
        content,
        mood: AI_CONFIG.MOODS[Math.floor(Math.random() * AI_CONFIG.MOODS.length)],
        timestamp: Date.now(),
        action,
        read: false,
      };
      
      update(state => ({
        ...state,
        messages: [...state.messages.slice(-49), message],
        lastInteraction: Date.now(),
        conversationHistory: [...state.conversationHistory.slice(-19), { role: 'assistant', content }],
      }));
      
      return message;
    },
    
    // 用户输入
    userInput: (text: string) => {
      const response = generateResponse(text);
      this.sendMessage('tip', response.content, response.action);
      
      // 保存对话历史
      update(state => ({
        ...state,
        conversationHistory: [
          ...state.conversationHistory.slice(-19),
          { role: 'user', content: text },
          { role: 'assistant', content: response.content },
        ],
      }));
      
      return response;
    },
    
    // 添加建议
    addSuggestion: (suggestion: Omit<AISuggestion, 'id'>) => {
      const newSuggestion: AISuggestion = {
        ...suggestion,
        id: `sug_${Date.now()}`,
      };
      
      update(state => ({
        ...state,
        suggestions: [...state.suggestions, newSuggestion],
      }));
      
      return newSuggestion;
    },
    
    // 移除建议
    removeSuggestion: (suggestionId: string) => {
      update(state => ({
        ...state,
        suggestions: state.suggestions.filter(s => s.id !== suggestionId),
      }));
    },
    
    // 完成教程步骤
    completeTutorialStep: (tutorialId: string, stepIndex: number) => {
      update(state => {
        const tutorial = state.tutorials.find(t => t.id === tutorialId);
        if (tutorial && tutorial.steps[stepIndex]) {
          tutorial.steps[stepIndex].completed = true;
          
          // 检查是否全部完成
          if (tutorial.steps.every(s => s.completed)) {
            tutorial.completed = true;
            this.sendMessage('celebration', '🎉 恭喜你完成了新手引导! 开始你的城市冒险吧!');
          }
        }
        return state;
      });
    },
    
    // 标记消息已读
    markAsRead: (messageId: string) => {
      update(state => {
        const message = state.messages.find(m => m.id === messageId);
        if (message) {
          message.read = true;
        }
        return state;
      });
    },
    
    // 更新设置
    updateSettings: (settings: Partial<typeof initialState.settings>) => {
      update(state => ({
        ...state,
        settings: { ...state.settings, ...settings },
      }));
    },
    
    // 设置情绪
    setMood: (mood: Mood) => {
      update(state => ({ ...state, mood }));
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const ai = createAIStore();

// ===============================
// Derived Stores
// ===============================

export const aiStats = derived(ai, $ai => {
  const unreadMessages = $ai.messages.filter(m => !m.read).length;
  const highPrioritySuggestions = $ai.suggestions.filter(s => s.priority === 'high').length;
  
  return {
    totalMessages: $ai.messages.length,
    unreadMessages,
    activeSuggestions: $ai.suggestions.length,
    highPrioritySuggestions,
    mood: $ai.mood,
    enabled: $ai.settings.enabled,
  };
});

export const unreadMessages = derived(ai, $ai => {
  return $ai.messages.filter(m => !m.read);
});

export const pendingSuggestions = derived(ai, $ai => {
  return $ai.suggestions;
});

// ===============================
// AI Response Generator
// ===============================

function generateResponse(input: string): {
  content: string;
  action?: AIMessage['action'];
} {
  const lowerInput = input.toLowerCase();
  
  // 问候
  if (lowerInput.includes('你好') || lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return {
      content: '你好!我是 CityBot,你的AI助手!有什么可以帮助你的吗? 🏙️',
      action: { label: '查看帮助', callback: 'show_help' },
    };
  }
  
  // 建造相关
  if (lowerInput.includes('建造') || lowerInput.includes('build')) {
    return {
      content: '建造是城市发展的基础!建议: ①优先建造资源产出建筑 ②升级关键建筑提升效率 ③合理规划布局',
      action: { label: '去建造', callback: 'open_build_menu' },
    };
  }
  
  // 战斗相关
  if (lowerInput.includes('战斗') || lowerInput.includes('battle') || lowerInput.includes('地牢')) {
    return {
      content: '战斗可以获得金币、USDC和稀有NFT!建议: ①提升战斗力再挑战 ②组队效率更高 ③注意能量消耗',
      action: { label: '进入地牢', callback: 'enter_dungeon' },
    };
  }
  
  // 赚钱相关
  if (lowerInput.includes('赚钱') || lowerInput.includes('money') || lowerInput.includes('赚')) {
    return {
      content: '赚钱方式: ①完成任务获得奖励 ②地牢战斗掉落 ③市场交易 ④质押挖矿(128% APY!) ⑤NFT交易',
      action: { label: '查看任务', callback: 'open_quests' },
    };
  }
  
  // 声望相关
  if (lowerInput.includes('声望') || lowerInput.includes('reputation')) {
    return {
      content: '声望可以解锁更多功能!提升方式: ①完成任务 ②赢得战斗 ③参与公会活动',
      action: { label: '查看声望', callback: 'show_reputation' },
    };
  }
  
  // 质押相关
  if (lowerInput.includes('质押') || lowerInput.includes('stake') || lowerInput.includes('apy')) {
    return {
      content: '质押USDC可获得128%年化收益!风险提示: 质押有锁定期,请合理安排资金。',
      action: { label: '去质押', callback: 'open_staking' },
    };
  }
  
  // 默认回复
  return {
    content: '我理解你的意思!在Solana AI City中,你可以建造城市、挑战地牢、交易NFT、参与公会战等。有什么具体想了解的吗? 🤔',
  };
}

// ===============================
// Smart Recommendations
// ===============================

export function generateSmartRecommendations(
  gameState: Record<string, any>
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // 能量建议
  if (gameState.energy < 20) {
    suggestions.push({
      id: 'energy_low',
      title: '⚡ 能量不足',
      description: '你的能量太低了!建议购买能量包或等待恢复。',
      type: 'economy',
      priority: 'high',
      action: () => {},
    });
  }
  
  // 任务建议
  if (gameState.dailyQuests < 5) {
    suggestions.push({
      id: 'quests_available',
      title: '📋 有可完成任务',
      description: '完成每日任务可获得金币和声望奖励!',
      type: 'quest',
      priority: 'medium',
      action: () => {},
    });
  }
  
  // 战斗建议
  if (gameState.canEnterDungeon) {
    suggestions.push({
      id: 'dungeon_ready',
      title: '⚔️ 可以挑战地牢',
      description: '地牢有丰富的奖励等你来拿!',
      type: 'battle',
      priority: 'medium',
      action: () => {},
    });
  }
  
  // 公会建议
  if (!gameState.hasGuild && gameState.level >= 5) {
    suggestions.push({
      id: 'guild_recommend',
      title: '🏰 加入公会',
      description: '加入公会可以获得额外奖励和社交乐趣!',
      type: 'social',
      priority: 'low',
      action: () => {},
    });
  }
  
  // 质押建议
  if (gameState.usdcBalance > 10 && !gameState.hasStaked) {
    suggestions.push({
      id: 'staking_opportunity',
      title: '💎 质押机会',
      description: '质押USDC可获得128% APY收益!',
      type: 'economy',
      priority: 'medium',
      action: () => {},
    });
  }
  
  return suggestions;
}

// ===============================
// Default Export
// ===============================

export default {
  ai,
  aiStats,
  unreadMessages,
  pendingSuggestions,
  AI_CONFIG,
  generateResponse,
  generateSmartRecommendations,
};
