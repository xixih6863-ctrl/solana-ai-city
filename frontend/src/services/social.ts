/**
 * Solana AI City - Social System
 * 社交系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const SOCIAL_CONFIG = {
  MAX_FRIENDS: 500,
  MAX_BLOCKED: 100,
  INVITE_REWARD: 200, // 声望奖励
  MAX_PENDING_INVITES: 50,
};

// ===============================
// Types
// ===============================

export interface Friend {
  userId: string;
  name: string;
  avatar: string;
  level: number;
  reputation: number;
  status: 'online' | 'offline' | 'away';
  lastActive: number;
  addedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'gift' | 'system';
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'guild' | 'friends' | 'private';
  messages: ChatMessage[];
  unreadCount: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  message: string;
  sentAt: number;
}

export interface InviteLink {
  code: string;
  createdAt: number;
  uses: number;
  maxUses: number;
  rewards: {
    inviter: number;
    invitee: number;
  };
}

// ===============================
// Social Store
// ===============================

function createSocialStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCitySocial')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        friends: [],
        blocked: [],
        pendingRequests: [],
        channels: {
          global: { id: 'global', name: '世界频道', type: 'global' as const, messages: [], unreadCount: 0 },
          friends: { id: 'friends', name: '好友频道', type: 'friends' as const, messages: [], unreadCount: 0 },
        },
        currentChat: null as string | null,
        invites: [],
        inviteCode: null,
        recentPlayers: [], // 近期一起游戏的玩家
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCitySocial', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 添加好友
    addFriend: (userId: string, name: string, avatar: string) => {
      const friend: Friend = {
        userId,
        name,
        avatar,
        level: 1,
        reputation: 0,
        status: 'offline',
        lastActive: Date.now(),
        addedAt: Date.now(),
      };
      
      update(state => {
        if (state.friends.find(f => f.userId === userId)) {
          throw new Error('已经是好友了!');
        }
        if (state.friends.length >= SOCIAL_CONFIG.MAX_FRIENDS) {
          throw new Error('好友已达上限!');
        }
        return { ...state, friends: [...state.friends, friend] };
      });
      
      return friend;
    },
    
    // 移除好友
    removeFriend: (userId: string) => {
      update(state => ({
        ...state,
        friends: state.friends.filter(f => f.userId !== userId),
      }));
    },
    
    // 接受好友请求
    acceptRequest: (requestId: string) => {
      let friend: Friend | null = null;
      
      update(state => {
        const request = state.pendingRequests.find(r => r.id === requestId);
        if (!request) return state;
        
        friend = {
          userId: request.fromUserId,
          name: request.fromUserName,
          avatar: request.fromUserAvatar,
          level: 1,
          reputation: 0,
          status: 'offline',
          lastActive: Date.now(),
          addedAt: Date.now(),
        };
        
        return {
          ...state,
          friends: [...state.friends, friend],
          pendingRequests: state.pendingRequests.filter(r => r.id !== requestId),
        };
      });
      
      return friend;
    },
    
    // 发送好友请求
    sendFriendRequest: (toUserId: string, message?: string) => {
      const request: FriendRequest = {
        id: `req_${Date.now()}`,
        fromUserId: 'current_user',
        fromUserName: 'You',
        fromUserAvatar: '👤',
        message: message || '',
        sentAt: Date.now(),
      };
      
      // TODO: 发送到服务器
      return request;
    },
    
    // 拉黑用户
    blockUser: (userId: string) => {
      update(state => {
        if (state.blocked.includes(userId)) return state;
        if (state.blocked.length >= SOCIAL_CONFIG.MAX_BLOCKED) {
          throw new Error('已拉黑用户已达上限!');
        }
        return { ...state, blocked: [...state.blocked, userId] };
      });
    },
    
    // 解除拉黑
    unblockUser: (userId: string) => {
      update(state => ({
        ...state,
        blocked: state.blocked.filter(id => id !== userId),
      }));
    },
    
    // 发送消息
    sendMessage: (channelId: string, content: string, type: 'text' | 'gift' | 'system' = 'text') => {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: 'current_user',
        senderName: 'You',
        receiverId: channelId,
        content,
        timestamp: Date.now(),
        read: true,
        type,
      };
      
      update(state => {
        const channel = state.channels[channelId as keyof typeof state.channels];
        if (channel) {
          channel.messages.push(message);
          channel.messages = channel.messages.slice(-100); // 只保留最近100条
        }
        return state;
      });
      
      return message;
    },
    
    // 创建邀请链接
    createInviteLink: (maxUses: number = 100) => {
      const code = `INV_${Date.now().toString(36).toUpperCase()}`;
      const invite: InviteLink = {
        code,
        createdAt: Date.now(),
        uses: 0,
        maxUses,
        rewards: {
          inviter: SOCIAL_CONFIG.INVITE_REWARD,
          invitee: 100, // 被邀请人获得100金币
        },
      };
      
      update(state => ({
        ...state,
        inviteCode: code,
        invites: [...state.invites, invite],
      }));
      
      return invite;
    },
    
    // 使用邀请链接
    useInviteLink: (code: string) => {
      // TODO: 验证并使用邀请码
      return { success: true, reward: 100 };
    },
    
    // 更新在线状态
    updateStatus: (status: Friend['status']) => {
      update(state => ({
        ...state,
      }));
    },
    
    // 添加到最近游戏
    addToRecent: (userId: string, name: string, avatar: string) => {
      update(state => {
        const existing = state.recentPlayers.findIndex(p => p.userId === userId);
        if (existing !== -1) {
          state.recentPlayers.splice(existing, 1);
        }
        state.recentPlayers.unshift({
          userId,
          name,
          avatar,
          level: 1,
          reputation: 0,
          status: 'offline',
          lastActive: Date.now(),
          addedAt: Date.now(),
        });
        state.recentPlayers = state.recentPlayers.slice(0, 20);
        return state;
      });
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const social = createSocialStore();

// ===============================
// Derived Stores
// ===============================

export const socialStats = derived(social, $social => {
  const onlineFriends = $social.friends.filter(f => f.status === 'online');
  
  return {
    totalFriends: $social.friends.length,
    onlineFriends: onlineFriends.length,
    pendingRequests: $social.pendingRequests.length,
    blockedCount: $social.blocked.length,
    unreadMessages: Object.values($social.channels).reduce((sum, c) => sum + c.unreadCount, 0),
    inviteCode: $social.inviteCode,
    invitesUsed: $social.invites.filter(i => i.uses >= i.maxUses).length,
  };
});

export const onlineFriends = derived(social, $social => {
  return $social.friends.filter(f => f.status === 'online');
});

// ===============================
// Helper Functions
// ===============================

export function getStatusColor(status: Friend['status']): string {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };
  return colors[status] || colors.offline;
}

export function getStatusText(status: Friend['status']): string {
  const texts: Record<string, string> = {
    online: '在线',
    offline: '离线',
    away: '离开',
  };
  return texts[status] || '离线';
}

export function formatLastActive(lastActive: number): string {
  const now = Date.now();
  const diff = now - lastActive;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
}

export function generateShareText(achievement: string, value: number): string {
  return `🏆 我在 Solana AI City 达成了「${achievement}」! 数值: ${value}`;
}

// ===============================
// Default Export
// ===============================

export default {
  social,
  socialStats,
  onlineFriends,
  SOCIAL_CONFIG,
  getStatusColor,
  getStatusText,
  formatLastActive,
  generateShareText,
};
