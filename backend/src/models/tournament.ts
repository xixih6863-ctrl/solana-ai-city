import { Schema, Document, Model } from 'mongoose';

// ============================================
// Tournament Bracket System
// ============================================

export interface ITournamentBracket extends Document {
  tournamentId: Schema.Types.ObjectId;
  name: string;
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  participants: IBracketParticipant[];
  matches: IBracketMatch[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface IBracketParticipant {
  userId: Schema.Types.ObjectId;
  seed: number;
  byes: number;
  wins: number;
  losses: number;
  points: number;
  dropped: boolean;
}

interface IBracketMatch {
  id: string;
  round: number;
  position: number;
  player1Id?: Schema.Types.ObjectId;
  player2Id?: Schema.Types.ObjectId;
  winnerId?: Schema.Types.ObjectId;
  score1?: number;
  score2?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'bye';
  scheduledAt?: Date;
  completedAt?: Date;
}

// ============================================
// Tournament Bracket Generator
// ============================================

export class BracketGenerator {
  private bracket: ITournamentBracket;
  private byes: number;

  constructor(
    tournamentId: Schema.Types.ObjectId,
    participants: Schema.Types.ObjectId[],
    type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' = 'single_elimination'
  ) {
    this.bracket = {
      tournamentId,
      name: `${type} bracket`,
      type,
      participants: participants.map((id, index) => ({
        userId: id,
        seed: index + 1,
        byes: 0,
        wins: 0,
        losses: 0,
        points: 0,
        dropped: false,
      })),
      matches: [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ITournamentBracket;

    this.byes = this.calculateByes(participants.length);
  }

  // Calculate number of byes needed for power of 2
  private calculateByes(participantCount: number): number {
    let size = 2;
    while (size < participantCount) {
      size *= 2;
    }
    return size - participantCount;
  }

  // Generate the bracket
  generate(): ITournamentBracket {
    switch (this.bracket.type) {
      case 'single_elimination':
        return this.generateSingleElimination();
      case 'double_elimination':
        return this.generateDoubleElimination();
      case 'round_robin':
        return this.generateRoundRobin();
      case 'swiss':
        return this.generateSwiss();
      default:
        return this.generateSingleElimination();
    }
  }

  // Single Elimination Bracket
  private generateSingleElimination(): ITournamentBracket {
    const rounds = Math.ceil(Math.log2(this.participants.length + this.byes));
    this.bracket.matches = [];

    // Create matches for each round
    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      
      for (let position = 1; position <= matchesInRound; position++) {
        const match: IBracketMatch = {
          id: `r${round}_m${position}`,
          round,
          position,
          status: 'pending',
        };

        // Handle byes
        if (this.byes > 0 && position <= this.byes / 2) {
          // Top seeds get byes in first round
          match.status = 'bye';
          match.player1Id = this.bracket.participants[position - 1].userId;
          this.bracket.participants[position - 1].byes = 1;
          this.byes -= 2;
        } else {
          match.player1Id = this.getParticipantForMatch(round, position, 1);
          match.player2Id = this.getParticipantForMatch(round, position, 2);
        }

        this.bracket.matches.push(match);
      }
    }

    return this.bracket;
  }

  // Double Elimination Bracket
  private generateDoubleElimination(): ITournamentBracket {
    // Generate winners bracket
    const winnersBracket = this.generateSingleElimination();
    
    // Create losers bracket (simplified)
    const losersBracket = this.generateLosersBracket(winnersBracket);

    // Combine brackets
    this.bracket.matches = [
      ...winnersBracket.matches,
      ...losersBracket,
    ];

    return this.bracket;
  }

  private generateLosersBracket(winnersBracket: ITournamentBracket): IBracketMatch[] {
    const losersMatches: IBracketMatch[] = [];
    const rounds = Math.ceil(Math.log2(this.participants.length + this.byes)) - 1;

    for (let round = 1; round <= rounds * 2 - 1; round++) {
      const matchesInRound = Math.pow(2, Math.max(0, rounds - Math.floor((round - 1) / 2) - 1));
      
      for (let position = 1; position <= matchesInRound; position++) {
        losersMatches.push({
          id: `losers_r${round}_m${position}`,
          round,
          position,
          status: 'pending',
        });
      }
    }

    return losersMatches;
  }

  // Round Robin
  private generateRoundRobin(): ITournamentBracket {
    const participants = this.bracket.participants;
    const rounds = participants.length % 2 === 0 
      ? participants.length - 1 
      : participants.length;
    
    const matchesPerRound = Math.floor(participants.length / 2);

    this.bracket.matches = [];

    // Generate round robin schedule
    for (let round = 1; round <= rounds; round++) {
      for (let position = 1; position <= matchesPerRound; position++) {
        const player1Index = (round + position - 2) % participants.length;
        const player2Index = (participants.length - position + round - 1) % participants.length;

        this.bracket.matches.push({
          id: `r${round}_m${position}`,
          round,
          position,
          player1Id: participants[player1Index].userId,
          player2Id: participants[player2Index].userId,
          status: 'pending',
        });
      }
    }

    return this.bracket;
  }

  // Swiss System
  private generateSwiss(): ITournamentBracket {
    // Swiss is similar to round robin but with pairing based on standings
    return this.generateRoundRobin();
  }

  private getParticipantForMatch(
    round: number,
    position: number,
    playerSlot: 1 | 2
  ): Schema.Types.ObjectId | undefined {
    const prevRound = round - 1;
    const prevMatch1Position = position * 2 - 2;
    const prevMatch2Position = position * 2 - 1;

    const prevMatch1 = this.bracket.matches.find(
      m => m.round === prevRound && m.position === prevMatch1Position
    );
    const prevMatch2 = this.bracket.matches.find(
      m => m.round === prevRound && m.position === prevMatch2Position
    );

    if (!prevMatch1 && playerSlot === 1) return undefined;
    if (!prevMatch2 && playerSlot === 2) return undefined;

    if (playerSlot === 1) {
      return prevMatch1?.winnerId;
    } else {
      return prevMatch2?.winnerId;
    }
  }

  getBracket(): ITournamentBracket {
    return this.bracket;
  }
}

// ============================================
// Seasonal Events System
// ============================================

export interface ISeasonalEvent extends Document {
  name: string;
  description: string;
  type: 'holiday' | 'competition' | 'milestone' | 'limited_time';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  rewards: IEventReward[];
  requirements: {
    minLevel: number;
    maxLevel?: number;
    mustOwn?: string[];
  };
  bonuses: {
    resourceMultiplier: number;
    xpMultiplier: number;
    dropRateBonus: number;
  };
  specialContent: {
    buildings?: string[];
    achievements?: string[];
    cosmetics?: string[];
    quests?: string[];
  };
  leaderboard: {
    enabled: boolean;
    rewards: IEventReward[];
    resetAt: Date;
  };
  createdAt: Date;
}

interface IEventReward {
  place?: number; // For leaderboards
  type: 'gold' | 'tokens' | 'nft' | 'achievement' | 'title' | 'cosmetic';
  value: number | string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Predefined Seasonal Events
export const SEASONAL_EVENTS: Partial<ISeasonalEvent>[] = [
  {
    name: 'New Year Celebration',
    description: 'Celebrate the new year with exclusive rewards!',
    type: 'holiday',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-07'),
    bonuses: {
      resourceMultiplier: 2,
      xpMultiplier: 1.5,
      dropRateBonus: 0.3,
    },
    specialContent: {
      buildings: ['fireworks_stand'],
      achievements: ['new_year_celebrator'],
      cosmetics: ['party_hat'],
    },
  },
  {
    name: 'Spring Festival',
    description: 'Spring is here! Grow your city with spring bonuses.',
    type: 'holiday',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-15'),
    bonuses: {
      resourceMultiplier: 1.5,
      xpMultiplier: 1.2,
      dropRateBonus: 0.2,
    },
    specialContent: {
      buildings: ['garden'],
      achievements: ['spring_gardener'],
    },
  },
  {
    name: 'Summer Games',
    description: 'Compete in summer-themed tournaments!',
    type: 'competition',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-30'),
    leaderboard: {
      enabled: true,
      rewards: [
        { place: 1, type: 'nft', value: 'summer_champion', rarity: 'legendary' },
        { place: 2, type: 'nft', value: 'summer_runner', rarity: 'epic' },
        { place: 3, type: 'nft', value: 'summer_finalist', rarity: 'rare' },
      ],
      resetAt: new Date('2026-07-01'),
    },
  },
  {
    name: 'Harvest Festival',
    description: 'A time of plenty! Bonus resources for all.',
    type: 'holiday',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-30'),
    bonuses: {
      resourceMultiplier: 2,
      xpMultiplier: 1.5,
      dropRateBonus: 0.25,
    },
    specialContent: {
      buildings: ['farm', 'market'],
      quests: ['harvest_quest_1', 'harvest_quest_2', 'harvest_quest_3'],
    },
  },
  {
    name: 'Anniversary Celebration',
    description: 'Celebrate 1 year of Solana AI City!',
    type: 'milestone',
    startDate: new Date('2026-02-07'),
    endDate: new Date('2026-02-14'),
    bonuses: {
      resourceMultiplier: 3,
      xpMultiplier: 2,
      dropRateBonus: 0.5,
    },
    rewards: [
      { type: 'achievement', value: 'anniversary_2026' },
      { type: 'title', value: 'Founding Member' },
    ],
    specialContent: {
      buildings: ['anniversary_monument'],
      achievements: ['anniversary_celebrator'],
      cosmetics: ['anniversary_badge'],
    },
  },
];

// ============================================
// Event Participation Tracker
// ============================================

export interface IEventParticipation extends Document {
  userId: Schema.Types.ObjectId;
  eventId: Schema.Types.ObjectId;
  score: number;
  contributions: {
    goldEarned: number;
    buildingsBuilt: number;
    questsCompleted: number;
    tradesExecuted: number;
  };
  rewardsClaimed: boolean;
  rank?: number;
  joinedAt: Date;
  lastActivity: Date;
}

export function calculateEventScore(
  participation: IEventParticipation,
  event: ISeasonalEvent
): number {
  const baseScore = participation.score;
  const multipliers = event.bonuses;
  
  // Apply bonuses
  const adjustedScore = baseScore * multipliers.resourceMultiplier;
  
  return Math.floor(adjustedScore);
}

export function getEventLeaderboardPosition(
  participations: IEventParticipation[],
  userId: Schema.Types.ObjectId
): number {
  const sorted = participations.sort((a, b) => b.score - a.score);
  const position = sorted.findIndex(p => p.userId.toString() === userId.toString());
  return position + 1;
}

// ============================================
// Point System
// ============================================

export interface PointConfig {
  action: string;
  points: number;
  dailyLimit?: number;
  eventMultiplier?: number;
}

export const POINT_SYSTEM: PointConfig[] = [
  // Building
  { action: 'build:house', points: 10, dailyLimit: 50 },
  { action: 'build:shop', points: 15, dailyLimit: 30 },
  { action: 'build:factory', points: 20, dailyLimit: 20 },
  { action: 'build:special', points: 25, dailyLimit: 10 },
  
  // Resources
  { action: 'collect:gold', points: 1, dailyLimit: 1000 },
  { action: 'collect:energy', points: 1, dailyLimit: 500 },
  
  // Quests
  { action: 'quest:complete:daily', points: 50 },
  { action: 'quest:complete:weekly', points: 200 },
  { action: 'quest:complete:story', points: 100 },
  
  // Achievements
  { action: 'achievement:unlock', points: 100 },
  
  // Social
  { action: 'social:friend_add', points: 20 },
  { action: 'social:guild_join', points: 50 },
  { action: 'trade:complete', points: 30 },
  
  // Competition
  { action: 'tournament:enter', points: 50 },
  { action: 'tournament:win', points: 500 },
  { action: 'leaderboard:top10', points: 200 },
  
  // Streak
  { action: 'streak:7days', points: 100 },
  { action: 'streak:30days', points: 500 },
];

export function getPoints(action: string, isEvent: boolean = false): number {
  const config = POINT_SYSTEM.find(p => p.action === action);
  if (!config) return 0;
  
  let points = config.points;
  
  // Apply event multiplier
  if (isEvent && config.action.startsWith('build')) {
    points *= 2;
  }
  
  return points;
}

export function getDailyLimit(action: string): number {
  const config = POINT_SYSTEM.find(p => p.action === action);
  return config?.dailyLimit || Infinity;
}

export function calculateRank(points: number): {
  rank: string;
  title: string;
  nextRank: { name: string; points: number };
} {
  const ranks = [
    { name: 'Novice', title: 'Novice Builder', minPoints: 0 },
    { name: 'Apprentice', title: 'Apprentice Architect', minPoints: 100 },
    { name: 'Craftsman', title: 'City Craftsman', minPoints: 500 },
    { name: 'Expert', title: 'Building Expert', minPoints: 2000 },
    { name: 'Master', title: 'Master Builder', minPoints: 5000 },
    { name: 'Grandmaster', title: 'Grandmaster Architect', minPoints: 10000 },
    { name: 'Legend', title: 'Legendary City Planner', minPoints: 25000 },
    { name: 'Mythic', title: 'Mythic Urban Designer', minPoints: 50000 },
  ];

  let currentRank = ranks[0];
  let nextRank = ranks[1];

  for (let i = 0; i < ranks.length; i++) {
    if (points >= ranks[i].minPoints) {
      currentRank = ranks[i];
      nextRank = ranks[i + 1] || ranks[i];
    }
  }

  return {
    rank: currentRank.name,
    title: currentRank.title,
    nextRank: {
      name: nextRank.name,
      points: nextRank.minPoints,
    },
  };
}

export default {
  BracketGenerator,
  SEASONAL_EVENTS,
  POINT_SYSTEM,
  getPoints,
  getDailyLimit,
  calculateRank,
};
