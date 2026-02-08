/**
 * Solana AI City - Friend List Component
 * 好友列表组件
 */

import { social, socialStats, onlineFriends, SOCIAL_CONFIG } from '../services/social';

export default function FriendList() {
  return {
    // Stats
    stats: socialStats,
    onlineList: onlineFriends,
    
    // Actions
    addFriend: (userId: string) => {
      social.addFriend(userId, 'Player', '👤');
    },
    
    removeFriend: (userId: string) => {
      social.removeFriend(userId);
    },
    
    blockUser: (userId: string) => {
      social.blockUser(userId);
    },
    
    sendMessage: (userId: string) => {
      // Open chat with user
    },
    
    viewProfile: (userId: string) => {
      // Show user profile
    },
    
    // Lists
    friends: () => {
      return social.friends || [];
    },
    
    pendingRequests: () => {
      return social.pendingRequests || [];
    },
    
    recentPlayers: () => {
      return social.recentPlayers || [];
    },
    
    // Max limits
    maxFriends: SOCIAL_CONFIG.MAX_FRIENDS,
    maxBlocked: SOCIAL_CONFIG.MAX_BLOCKED,
  };
}
