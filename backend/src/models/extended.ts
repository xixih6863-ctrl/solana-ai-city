import { Schema, Document, Model, models, model } from 'mongoose';

// ============================================
// Guild Model
// ============================================

export interface IGuild extends Document {
  name: string;
  description: string;
  tag: string;
  leaderId: Schema.Types.ObjectId;
  members: IGuildMember[];
  settings: {
    isPublic: boolean;
    minLevel: number;
    maxMembers: number;
    allowJoin: boolean;
  };
  stats: {
    totalGold: number;
    totalBuildings: number;
    averageLevel: number;
    totalQuestsCompleted: number;
  };
  resources: {
    gold: number;
    tokens: number;
  };
  reputation: number;
  level: number;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IGuildMember {
  userId: Schema.Types.ObjectId;
  role: 'leader' | 'officer' | 'member';
  joinedAt: Date;
  contributions: number;
  lastActive: Date;
}

const GuildSchema = new Schema<IGuild>({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  tag: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 5,
    uppercase: true,
  },
  leaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['leader', 'officer', 'member'] },
    joinedAt: Date,
    contributions: { type: Number, default: 0 },
    lastActive: Date,
  }],
  settings: {
    isPublic: { type: Boolean, default: true },
    minLevel: { type: Number, default: 1 },
    maxMembers: { type: Number, default: 50 },
    allowJoin: { type: Boolean, default: true },
  },
  stats: {
    totalGold: { type: Number, default: 0 },
    totalBuildings: { type: Number, default: 0 },
    averageLevel: { type: Number, default: 1 },
    totalQuestsCompleted: { type: Number, default: 0 },
  },
  resources: {
    gold: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
  },
  reputation: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Indexes
GuildSchema.index({ name: 'text' });
GuildSchema.index({ 'stats.averageLevel': -1 });
GuildSchema.index({ reputation: -1 });

export const Guild: Model<IGuild> = models.Guild || model<IGuild>('Guild', GuildSchema);

// ============================================
// Tournament Model
// ============================================

export interface ITournament extends Document {
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'building' | 'resources' | 'quests' | 'trading' | 'mixed';
  status: 'upcoming' | 'registration' | 'active' | 'completed' | 'cancelled';
  rules: {
    participationType: 'individual' | 'guild';
    scoringType: 'points' | 'time' | 'value';
    entryFee?: number;
    maxParticipants?: number;
    duration: number; // hours
  };
  prizes: {
    place: number;
    rewards: {
        type: String,
        value: Number,
    }[];
  }[];
  schedule: {
    registrationStart: Date;
    registrationEnd: Date;
    startDate: Date;
    endDate: Date;
  };
  participants: {
    userId: Schema.Types.ObjectId;
    guildId?: Schema.Types.ObjectId;
    score: number;
    rank: number;
    submissions: number;
    lastSubmission: Date;
  }[];
  results: {
    userId: Schema.Types.ObjectId;
    guildId?: Schema.Types.ObjectId;
    place: number;
    score: number;
    claimed: boolean;
  }[];
  createdBy: Schema.Types.ObjectId;
}

const TournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'special'] },
  category: { type: String, enum: ['building', 'resources', 'quests', 'trading', 'mixed'] },
  status: { type: String, enum: ['upcoming', 'registration', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  rules: {
    participationType: { type: String, enum: ['individual', 'guild'] },
    scoringType: { type: String, enum: ['points', 'time', 'value'] },
    entryFee: Number,
    maxParticipants: Number,
    duration: { type: Number, required: true },
  },
  prizes: [{
    place: Number,
    rewards: [{
      type: String,
      value: Number,
    }],
  }],
  schedule: {
    registrationStart: Date,
    registrationEnd: Date,
    startDate: Date,
    endDate: Date,
  },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild' },
    score: { type: Number, default: 0 },
    rank: Number,
    submissions: { type: Number, default: 0 },
    lastSubmission: Date,
  }],
  results: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild' },
    place: Number,
    score: Number,
    claimed: { type: Boolean, default: false },
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

TournamentSchema.index({ status: 1, 'schedule.startDate': 1 });
TournamentSchema.index({ 'participants.userId': 1 });

export const Tournament: Model<ITournament> = models.Tournament || model<ITournament>('Tournament', TournamentSchema);

// ============================================
// Daily Login Reward Model
// ============================================

export interface IDailyReward extends Document {
  userId: Schema.Types.ObjectId;
  streak: number;
  lastClaimed: Date;
  totalClaimed: number;
  rewards: {
    day: number;
    claimed: boolean;
    claimedAt?: Date;
  }[];
}

const DailyRewardSchema = new Schema<IDailyReward>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  streak: { type: Number, default: 0 },
  lastClaimed: Date,
  totalClaimed: { type: Number, default: 0 },
  rewards: [{
    day: Number,
    claimed: { type: Boolean, default: false },
    claimedAt: Date,
  }],
}, {
  timestamps: true,
});

DailyRewardSchema.index({ userId: 1 }, { unique: true });

export const DailyReward: Model<IDailyReward> = models.DailyReward || model<IDailyReward>('DailyReward', DailyRewardSchema);

// ============================================
// User Activity Log
// ============================================

export interface IActivityLog extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  category: string;
  details: Record<string, any>;
  metadata: {
    sessionId?: string;
    ip?: string;
    userAgent?: string;
  };
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  category: { type: String, required: true },
  details: Schema.Types.Mixed,
  metadata: {
    sessionId: String,
    ip: String,
    userAgent: String,
  },
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  timestamps: false,
});

export const ActivityLog: Model<IActivityLog> = models.ActivityLog || model<IActivityLog>('ActivityLog', ActivityLogSchema);

// ============================================
// Analytics Aggregates
// ============================================

export interface IAnalyticsDaily extends Document {
  date: Date;
  metrics: {
    newUsers: number;
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
    newCities: number;
    totalBuildings: number;
    totalTrades: number;
    totalGoldEarned: number;
    totalEnergyUsed: number;
    questsCompleted: number;
    achievementsUnlocked: number;
    nftsMinted: number;
  };
  revenue: {
    gross: number;
    net: number;
    currency: string;
  };
}

const AnalyticsDailySchema = new Schema<IAnalyticsDaily>({
  date: { type: Date, required: true, unique: true },
  metrics: {
    newUsers: Number,
    activeUsers: Number,
    totalSessions: Number,
    avgSessionDuration: Number,
    newCities: Number,
    totalBuildings: Number,
    totalTrades: Number,
    totalGoldEarned: Number,
    totalEnergyUsed: Number,
    questsCompleted: Number,
    achievementsUnlocked: Number,
    nftsMinted: Number,
  },
  revenue: {
    gross: Number,
    net: Number,
    currency: { type: String, default: 'USD' },
  },
}, {
  timestamps: true,
});

AnalyticsDailySchema.index({ date: -1 });

export const AnalyticsDaily: Model<IAnalyticsDaily> = models.AnalyticsDaily || model<IAnalyticsDaily>('AnalyticsDaily', AnalyticsDailySchema);

// ============================================
// Badge Model
// ============================================

export interface IBadge extends Document {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    target: string;
    value: number;
  }[];
  isActive: boolean;
  mintedCount: number;
}

const BadgeSchema = new Schema<IBadge>({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  icon: String,
  category: String,
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] },
  requirements: [{
    type: String,
    target: String,
    value: Number,
  }],
  isActive: { type: Boolean, default: true },
  mintedCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export const Badge: Model<IBadge> = models.Badge || model<IBadge>('Badge', BadgeSchema);

// ============================================
// User Badge Model
// ============================================

export interface IUserBadge extends Document {
  userId: Schema.Types.ObjectId;
  badgeId: Schema.Types.ObjectId;
  earnedAt: Date;
  isVisible: boolean;
}

const UserBadgeSchema = new Schema<IUserBadge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true },
}, {
  timestamps: true,
});

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge: Model<IUserBadge> = models.UserBadge || model<IUserBadge>('UserBadge', UserBadgeSchema);

export default {
  Guild,
  Tournament,
  DailyReward,
  ActivityLog,
  AnalyticsDaily,
  Badge,
  UserBadge,
};
