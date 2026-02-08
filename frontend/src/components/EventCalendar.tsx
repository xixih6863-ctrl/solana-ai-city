/**
 * Solana AI City - Event Calendar Component
 * 活动日历组件
 */

import { events, eventStats, activeEvents, upcomingEvents, EVENTS_CONFIG } from '../services/events';

export default function EventCalendar() {
  return {
    // Stats
    stats: eventStats,
    
    // Event lists
    active: activeEvents,
    upcoming: upcomingEvents,
    
    // Actions
    joinEvent: (eventId: string) => {
      events.joinEvent(eventId);
    },
    
    claimLoginBonus: () => {
      return events.claimLoginBonus();
    },
    
    viewEventDetails: (eventId: string) => {
      // Show event details
    },
    
    // Login bonus
    loginBonus: () => {
      return {
        streak: events.loginBonus?.currentStreak || 0,
        canClaim: events.canClaimLoginBonus(),
        todayReward: '1000 金币',
      };
    },
    
    // Calendar
    holidays: EVENTS_CONFIG.HOLIDAYS,
    
    // Templates
    templates: () => {
      return EVENTS_CONFIG.EVENT_TEMPLATES || [];
    },
  };
}
