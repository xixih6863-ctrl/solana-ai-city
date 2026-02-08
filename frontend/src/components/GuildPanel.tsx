/**
 * Solana AI City - Guild Panel Component
 * 公会面板组件
 */

import { guild, guildStats, GUILD_CONFIG } from '../services/guild';

export default function GuildPanel() {
  return {
    // Panel tabs
    tabs: ['info', 'members', 'wars', 'shop', 'tasks'],
    activeTab: 'info',
    
    // Guild info display
    displayInfo: () => {
      const stats = guildStats;
      return {
        name: 'Solana City',
        level: stats?.level || 1,
        members: stats?.memberCount || 0,
        maxMembers: stats?.maxMembers || 10,
        exp: stats?.exp || 0,
        isRecruiting: stats?.isRecruiting || false,
      };
    },
    
    // Member list
    displayMembers: () => {
      return guild.myGuild?.members || [];
    },
    
    // Actions
    createGuild: () => {
      // Open create guild modal
    },
    
    joinGuild: () => {
      // Open guild list
    },
    
    donate: () => {
      // Open donation modal
    },
    
    declareWar: () => {
      // Open war declaration
    },
  };
}
