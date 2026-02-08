import { City, User, Achievement, BuildingStats } from '../models/index.js';

// ============================================
// AI Recommendation Engine
// ============================================

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: number; // 1-10, higher = more urgent
  title: string;
  description: string;
  action: string;
  expectedValue: number;
  risk: 'low' | 'medium' | 'high';
  roi?: number;
  timeToComplete?: number;
  requirements?: string[];
}

export type RecommendationType =
  | 'building'      // Building suggestions
  | 'upgrade'      // Upgrade recommendations
  | 'quest'        // Quest tips
  | 'resource'     // Resource optimization
  | 'social'       // Social opportunities
  | 'achievement'  // Achievement hints
  | 'event'        // Event participation
  | 'market'       // Market opportunities
  | 'strategy';    // Strategic advice

export interface PlayerContext {
  user: {
    id: string;
    level: number;
    experience: number;
    gold: number;
    energy: number;
    population: number;
    points: number;
    rank: number;
    achievements: string[];
    lastActive: Date;
    subscription?: string;
  };
  city: {
    id: string;
    buildings: any[];
    resources: {
      gold: number;
      energy: number;
      population: number;
      tokens: number;
    };
    grid: number[][];
  };
  preferences: {
    playStyle: 'casual' | 'competitive' | 'strategic';
    goals: string[];
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

// ============================================
// Recommendation Engine
// ============================================

export class AIRecommendationEngine {
  private context: PlayerContext;

  constructor(context: PlayerContext) {
    this.context = context;
  }

  // Generate all recommendations
  async generateRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Generate different types of recommendations
    recommendations.push(...(await this.generateBuildingRecommendations()));
    recommendations.push(...(await this.generateUpgradeRecommendations()));
    recommendations.push(...(await this.generateResourceRecommendations()));
    recommendations.push(...(await this.generateQuestRecommendations()));
    recommendations.push(...(await this.generateAchievementRecommendations()));
    recommendations.push(...(await this.generateSocialRecommendations()));
    recommendations.push(...(await this.generateMarketRecommendations()));
    recommendations.push(...(await this.generateStrategicRecommendations()));

    // Sort by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations.slice(0, 20); // Return top 20 recommendations
  }

  // ============================================
  // Building Recommendations
  // ============================================

  private async generateBuildingRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { city, user } = this.context;
    const buildingCounts = this.countBuildings(city.buildings);
    
    // Check for missing essential buildings
    if (!buildingCounts.power) {
      recommendations.push({
        id: `build_power_${Date.now()}`,
        type: 'building',
        priority: 10,
        title: '🔌 Build a Power Plant',
        description: 'Your city needs energy production! A Power Plant provides continuous energy generation to power your buildings.',
        action: 'build:power',
        expectedValue: 20, // +20 energy per tick
        risk: 'low',
        roi: 150, // 150% return
        timeToComplete: 5,
        requirements: ['1000 gold', 'Level 5+'],
      });
    }

    // Suggest based on population
    const populationPerHouse = 5;
    const currentPopulation = user.population;
    const houseCapacity = buildingCounts.house * populationPerHouse * 2;
    
    if (currentPopulation > houseCapacity * 0.8) {
      recommendations.push({
        id: `expand_housing_${Date.now()}`,
        type: 'building',
        priority: 8,
        title: '🏠 Expand Housing',
        description: `Your population is approaching capacity (${currentPopulation}/${houseCapacity}). Build more houses to grow!`,
        action: 'build:house',
        expectedValue: 50,
        risk: 'low',
        roi: 120,
        timeToComplete: 3,
      });
    }

    // Commercial buildings for income
    if (user.level >= 5 && !buildingCounts.shop) {
      recommendations.push({
        id: `build_shop_${Date.now()}`,
        type: 'building',
        priority: 7,
        title: '🛒 Build a Shop',
        description: 'Shops generate passive income! Commercial buildings are essential for long-term wealth.',
        action: 'build:shop',
        expectedValue: 100,
        risk: 'low',
        roi: 200,
        timeToComplete: 5,
        requirements: ['500 gold', 'Level 5+'],
      });
    }

    // Industrial for production
    if (user.level >= 8 && !buildingCounts.factory) {
      recommendations.push({
        id: `build_factory_${Date.now()}`,
        type: 'building',
        priority: 6,
        title: '🏭 Build a Factory',
        description: 'Factories boost overall production efficiency by 15%. Great for competitive players!',
        action: 'build:factory',
        expectedValue: 150,
        risk: 'medium',
        roi: 180,
        timeToComplete: 10,
        requirements: ['1000 gold', 'Level 8+'],
      });
    }

    // Special buildings
    if (user.level >= 10 && !buildingCounts.hospital) {
      recommendations.push({
        id: `build_hospital_${Date.now()}`,
        type: 'building',
        priority: 5,
        title: '🏥 Build a Hospital',
        description: 'Hospitals heal citizens and reduce population decline. Essential for maintaining growth!',
        action: 'build:hospital',
        expectedValue: 80,
        risk: 'low',
        timeToComplete: 15,
        requirements: ['2000 gold', 'Level 10+'],
      });
    }

    return recommendations;
  }

  // ============================================
  // Upgrade Recommendations
  // ============================================

  private async generateUpgradeRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { city, user } = this.context;

    // Find buildings that can be upgraded
    for (const building of city.buildings) {
      const upgradeCost = this.calculateUpgradeCost(building.type, building.level);
      
      if (user.gold >= upgradeCost && building.level < 10) {
        const roi = this.calculateUpgradeROI(building.type, building.level);
        
        recommendations.push({
          id: `upgrade_${building.id}_${Date.now()}`,
          type: 'upgrade',
          priority: Math.min(7, Math.floor(roi / 20)),
          title: `⬆️ Upgrade ${this.formatBuildingName(building.type)}`,
          description: `Upgrading to level ${building.level + 1} will increase ${this.getBuildingBenefit(building.type)}`,
          action: `upgrade:${building.id}`,
          expectedValue: upgradeCost * (roi / 100),
          risk: 'low',
          roi,
          timeToComplete: Math.ceil(building.level / 2),
        });
      }
    }

    return recommendations;
  }

  // ============================================
  // Resource Recommendations
  // ============================================

  private async generateResourceRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { user, city } = this.context;

    // Energy management
    if (user.energy < 20) {
      recommendations.push({
        id: `energy_refill_${Date.now()}`,
        type: 'resource',
        priority: 9,
        title: '⚡ Restore Energy',
        description: 'Your energy is critically low! Visit the shop or wait for natural regeneration.',
        action: 'shop:energy',
        expectedValue: 100,
        risk: 'low',
      });
    }

    // Resource optimization
    if (city.resources.gold > user.level * 500 && city.buildings.length < 20) {
      recommendations.push({
        id: `invest_gold_${Date.now()}`,
        type: 'resource',
        priority: 7,
        title: '💰 Invest Surplus Gold',
        description: `You have ${city.resources.gold} gold. Invest in buildings for better returns!`,
        action: 'build:recommendation',
        expectedValue: city.resources.gold * 0.3,
        risk: 'low',
      });
    }

    // Population growth
    if (user.population < city.buildings.length * 10 && city.buildings.length > 5) {
      recommendations.push({
        id: `population_growth_${Date.now()}`,
        type: 'resource',
        priority: 6,
        title: '👥 Focus on Population',
        description: 'Population drives city growth! Build more residential areas.',
        action: 'build:residential',
        expectedValue: 200,
        risk: 'low',
      });
    }

    return recommendations;
  }

  // ============================================
  // Quest Recommendations
  // ============================================

  private async generateQuestRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { user } = this.context;

    // Daily quest reminder
    const timeSinceActive = Date.now() - new Date(user.lastActive).getTime();
    if (timeSinceActive > 4 * 60 * 60 * 1000) { // 4 hours
      recommendations.push({
        id: `daily_quest_${Date.now()}`,
        type: 'quest',
        priority: 8,
        title: '📅 Daily Quests Reset!',
        description: 'New daily quests are available! Complete them for bonus rewards.',
        action: 'quests:daily',
        expectedValue: 500,
        risk: 'low',
        timeToComplete: 30,
      });
    }

    // Weekly challenge
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 1) { // Monday
      recommendations.push({
        id: `weekly_quest_${Date.now()}`,
        type: 'quest',
        priority: 7,
        title: '📆 Weekly Challenge Available',
        description: 'The weekly challenge has reset! Big rewards await!',
        action: 'quests:weekly',
        expectedValue: 2000,
        risk: 'low',
        timeToComplete: 60,
      });
    }

    return recommendations;
  }

  // ============================================
  // Achievement Recommendations
  // ============================================

  private async generateAchievementRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { user, city } = this.context;

    // Near completion achievements
    const achievementProgress = this.calculateAchievementProgress(user.achievements);
    
    if (achievementProgress.nearCompletion.length > 0) {
      const nextAchievement = achievementProgress.nearCompletion[0];
      
      recommendations.push({
        id: `achievement_${nextAchievement.id}_${Date.now()}`,
        type: 'achievement',
        priority: 6,
        title: `🏆 ${nextAchievement.name}`,
        description: nextAchievement.description,
        action: `achievement:${nextAchievement.id}`,
        expectedValue: nextAchievement.rewards,
        risk: 'low',
        timeToComplete: 15,
      });
    }

    // Locked achievements
    if (achievementProgress.locked.length > 0) {
      const nextUnlock = achievementProgress.locked[0];
      
      recommendations.push({
        id: `unlock_${nextUnlock.id}_${Date.now()}`,
        type: 'achievement',
        priority: 4,
        title: `🔒 ${nextUnlock.name}`,
        description: `Unlock at ${nextUnlock.unlockLevel} to access this achievement!`,
        action: 'level_up',
        expectedValue: nextUnlock.rewards,
        risk: 'low',
        timeToComplete: 1440, // 24 hours
      });
    }

    return recommendations;
  }

  // ============================================
  // Social Recommendations
  // ============================================

  private async generateSocialRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { user, preferences } = this.context;

    // Friend bonus
    if (user.level < 10) {
      recommendations.push({
        id: `make_friends_${Date.now()}`,
        type: 'social',
        priority: 5,
        title: '👥 Make Friends',
        description: 'Adding friends gives bonus rewards and unlocks co-op features!',
        action: 'social:add_friends',
        expectedValue: 300,
        risk: 'low',
      });
    }

    // Guild suggestion
    if (!user.achievements.includes('guild_member') && user.level >= 5) {
      recommendations.push({
        id: `join_guild_${Date.now()}`,
        type: 'social',
        priority: 6,
        title: '🏰 Join a Guild',
        description: 'Guilds provide exclusive bonuses and community rewards!',
        action: 'guild:join',
        expectedValue: 500,
        risk: 'low',
      });
    }

    // Tournament
    recommendations.push({
      id: `tournament_${Date.now()}`,
      type: 'event',
      priority: 7,
      title: '🏆 Tournament Active!',
      description: 'A tournament is happening now! Compete for exclusive rewards!',
      action: 'tournament:join',
      expectedValue: 3000,
      risk: 'medium',
      timeToComplete: 30,
    });

    return recommendations;
  }

  // ============================================
  // Market Recommendations
  // ============================================

  private generateMarketRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { user } = this.context;

    // Token opportunity
    recommendations.push({
      id: `buy_tokens_${Date.now()}`,
      type: 'market',
      priority: 4,
      title: '📈 Token Sale Active!',
      description: 'Limited-time token discount available in the shop!',
      action: 'shop:tokens',
      expectedValue: 500,
      risk: 'medium',
    });

    return recommendations;
  }

  // ============================================
  // Strategic Recommendations
  // ============================================

  private generateStrategicRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { user, preferences } = this.context;

    // Long-term strategy
    if (user.level < 20) {
      recommendations.push({
        id: `strategy_early_${Date.now()}`,
        type: 'strategy',
        priority: 3,
        title: '🎯 Early Game Strategy',
        description: 'Focus on resource generation buildings first. Population follows gold!',
        action: 'guide:strategy',
        expectedValue: 1000,
        risk: 'low',
        timeToComplete: 1440,
      });
    }

    // Competitive advice
    if (preferences.playStyle === 'competitive') {
      recommendations.push({
        id: `strategy_competitive_${Date.now()}`,
        type: 'strategy',
        priority: 4,
        title: '⚔️ Competitive Edge',
        description: 'Focus on achievements and leaderboard positions for maximum points!',
        action: 'guide:competitive',
        expectedValue: 2000,
        risk: 'medium',
      });
    }

    return recommendations;
  }

  // ============================================
  // Helper Methods
  // ============================================

  private countBuildings(buildings: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const building of buildings) {
      counts[building.type] = (counts[building.type] || 0) + 1;
    }
    return counts;
  }

  private calculateUpgradeCost(type: string, level: number): number {
    const baseCosts: Record<string, number> = {
      house: 100,
      shop: 200,
      factory: 300,
      power: 500,
      hospital: 1000,
    };
    const baseCost = baseCosts[type] || 100;
    return Math.floor(baseCost * Math.pow(1.5, level));
  }

  private calculateUpgradeROI(type: string, level: number): number {
    const roiMultipliers: Record<string, number> = {
      house: 20,
      shop: 25,
      factory: 30,
      power: 40,
      hospital: 35,
    };
    const multiplier = roiMultipliers[type] || 20;
    return Math.floor(100 + multiplier * level);
  }

  private formatBuildingName(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getBuildingBenefit(type: string): string {
    const benefits: Record<string, string> = {
      house: 'population capacity',
      shop: 'passive gold income',
      factory: 'production efficiency',
      power: 'energy generation',
      hospital: 'population healing',
    };
    return benefits[type] || 'overall stats';
  }

  private calculateAchievementProgress(
    earnedAchievements: string[]
  ): { nearCompletion: any[]; locked: any[] } {
    const allAchievements = [
      { id: 'first_build', name: 'First Build', description: 'Build your first building', unlockLevel: 1, rewards: 100 },
      { id: 'pop_100', name: 'Growing City', description: 'Reach 100 population', unlockLevel: 5, rewards: 200 },
      { id: 'pop_1000', name: 'Major City', description: 'Reach 1000 population', unlockLevel: 10, rewards: 500 },
      { id: 'guild_member', name: 'Social Butterfly', description: 'Join a guild', unlockLevel: 5, rewards: 300 },
      { id: 'tournament_winner', name: 'Champion', description: 'Win a tournament', unlockLevel: 15, rewards: 1000 },
    ];

    const earned = earnedAchievements.map(id => ({ id }));
    const earnedIds = new Set(earnedAchievements);

    return {
      nearCompletion: allAchievements.filter(
        a => !earnedIds.has(a.id) && a.unlockLevel <= this.context.user.level + 2
      ),
      locked: allAchievements.filter(
        a => !earnedIds.has(a.id) && a.unlockLevel > this.context.user.level + 2
      ),
    };
  }
}

// ============================================
// Utility Functions
// ============================================

export function calculateCityScore(city: any, user: any): number {
  let score = 0;
  
  // Building score
  score += city.buildings.length * 10;
  
  // Level score
  score += user.level * 100;
  
  // Resource score
  score += city.resources.gold * 0.1;
  score += city.resources.population * 1;
  
  // Activity score
  const daysActive = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  score += daysActive * 5;

  return Math.floor(score);
}

export function predictGrowth(
  currentResources: any,
  buildings: any[],
  days: number
): { gold: number; population: number; energy: number } {
  let dailyGold = 0;
  let dailyEnergy = 0;
  let dailyPopulation = 0;

  for (const building of buildings) {
    const level = building.level;
    switch (building.type) {
      case 'house':
        dailyPopulation += 5 * level;
        break;
      case 'shop':
        dailyGold += 10 * level;
        break;
      case 'power':
        dailyEnergy += 20 * level;
        break;
    }
  }

  return {
    gold: currentResources.gold + dailyGold * days,
    population: currentResources.population + dailyPopulation * days,
    energy: Math.min(100, currentResources.energy + dailyEnergy * days),
  };
}

export function suggestOptimalBuildOrder(
  currentBuildings: any[],
  userLevel: number,
  availableGold: number
): { type: string; priority: number; reason: string }[] {
  const suggestions: { type: string; priority: number; reason: string }[] = [];

  // Check what's missing
  const hasPower = currentBuildings.some(b => b.type === 'power');
  const hasHousing = currentBuildings.some(b => b.type === 'house');
  const hasIncome = currentBuildings.some(b => ['shop', 'factory'].includes(b.type));

  if (!hasPower && availableGold >= 1000 && userLevel >= 5) {
    suggestions.push({
      type: 'power',
      priority: 10,
      reason: 'Energy is essential for all buildings',
    });
  }

  if (!hasHousing && availableGold >= 100) {
    suggestions.push({
      type: 'house',
      priority: 9,
      reason: 'Housing enables population growth',
    });
  }

  if (!hasIncome && availableGold >= 200 && userLevel >= 5) {
    suggestions.push({
      type: 'shop',
      priority: 8,
      reason: 'Income buildings provide passive gold',
    });
  }

  return suggestions.sort((a, b) => b.priority - a.priority);
}

export default {
  AIRecommendationEngine,
  calculateCityScore,
  predictGrowth,
  suggestOptimalBuildOrder,
};
