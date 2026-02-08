import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// User Model
// ============================================

export interface IUser extends Document {
  walletAddress: string;
  username: string;
  email?: string;
  avatar?: string;
  level: number;
  experience: number;
  gold: number;
  energy: number;
  population: number;
  points: number;
  rank: number;
  achievements: string[];
  friends: string[];
  guildId?: string;
  settings: {
    notifications: boolean;
    publicProfile: boolean;
    showOnLeaderboard: boolean;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    sparse: true,
  },
  avatar: {
    type: String,
    default: '👤',
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  experience: {
    type: Number,
    default: 0,
  },
  gold: {
    type: Number,
    default: 1000,
  },
  energy: {
    type: Number,
    default: 100,
  },
  population: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  achievements: [{
    type: String,
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  guildId: {
    type: Schema.Types.ObjectId,
    ref: 'Guild',
  },
  settings: {
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    showOnLeaderboard: { type: Boolean, default: true },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ points: -1 });
UserSchema.index({ level: -1 });
UserSchema.index({ lastActive: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);

// ============================================
// City Model
// ============================================

export interface ICity extends Document {
  ownerId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  buildings: IBuilding[];
  resources: {
    gold: number;
    energy: number;
    population: number;
    tokens: number;
  };
  grid: number[][];
  settings: {
    isPublic: boolean;
    allowVisitors: boolean;
  };
  stats: {
    totalBuildings: number;
    totalValue: number;
    buildingsLevel: number;
  };
  lastSave: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IBuilding {
  id: string;
  type: string;
  position: { x: number; y: number };
  level: number;
  builtAt: Date;
  upgradedAt?: Date;
}

const CitySchema = new Schema<ICity>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  buildings: [{
    id: String,
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    level: { type: Number, default: 1 },
    builtAt: { type: Date, default: Date.now },
    upgradedAt: Date,
  }],
  resources: {
    gold: { type: Number, default: 1000 },
    energy: { type: Number, default: 100 },
    population: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
  },
  grid: [[Number]],
  settings: {
    isPublic: { type: Boolean, default: true },
    allowVisitors: { type: Boolean, default: true },
  },
  stats: {
    totalBuildings: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    buildingsLevel: { type: Number, default: 0 },
  },
  lastSave: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

CitySchema.index({ 'stats.totalValue': -1 });
CitySchema.index({ 'resources.population': -1 });

export const City = mongoose.model<ICity>('City', CitySchema);

// ============================================
// Achievement Model
// ============================================

export interface IAchievement extends Document {
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
  rewards: {
    type: string;
    value: number;
  }[];
  isSecret: boolean;
  chainTo: string[];
  isActive: boolean;
  mintedCount: number;
}

const AchievementSchema = new Schema<IAchievement>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  icon: String,
  category: String,
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  },
  requirements: [{
    type: String,
    target: String,
    value: Number,
  }],
  rewards: [{
    type: String,
    value: Number,
  }],
  isSecret: {
    type: Boolean,
    default: false,
  },
  chainTo: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  mintedCount: {
    type: Number,
    default: 0,
  },
});

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

// ============================================
// Quest Model
// ============================================

export interface IQuest extends Document {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'challenge';
  category: string;
  difficulty: number;
  requirements: {
    type: string;
    target: string;
    value: number;
  }[];
  rewards: {
    gold?: number;
    xp?: number;
    tokens?: number;
    achievement?: string;
  };
  timeLimit?: number;
  prerequisites: string[];
  isActive: boolean;
  order: number;
}

const QuestSchema = new Schema<IQuest>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['daily', 'weekly', 'story', 'challenge'],
  },
  category: String,
  difficulty: { type: Number, min: 1, max: 5 },
  requirements: [{
    type: String,
    target: String,
    value: Number,
  }],
  rewards: {
    gold: Number,
    xp: Number,
    tokens: Number,
    achievement: String,
  },
  timeLimit: Number,
  prerequisites: [String],
  isActive: { type: Boolean, default: true },
  order: Number,
});

export const Quest = mongoose.model<IQuest>('Quest', QuestSchema);

// ============================================
// UserQuest Model (User Quest Progress)
// ============================================

export interface IUserQuest extends Document {
  userId: Schema.Types.ObjectId;
  questId: Schema.Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed' | 'claimed';
  progress: {
    type: string;
    current: number;
  }[];
  startedAt?: Date;
  completedAt?: Date;
  claimedAt?: Date;
}

const UserQuestSchema = new Schema<IUserQuest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questId: {
    type: Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'claimed'],
    default: 'not_started',
  },
  progress: [{
    type: String,
    current: { type: Number, default: 0 },
  }],
  startedAt: Date,
  completedAt: Date,
  claimedAt: Date,
}, {
  timestamps: true,
});

UserQuestSchema.index({ userId: 1, questId: 1 }, { unique: true });

export const UserQuest = mongoose.model<IUserQuest>('UserQuest', UserQuestSchema);

// ============================================
// Trade Model
// ============================================

export interface ITrade extends Document {
  fromUserId: Schema.Types.ObjectId;
  toUserId: Schema.Types.ObjectId;
  offer: {
    type: string;
    itemId: string;
    quantity: number;
  }[];
  request: {
    type: string;
    itemId: string;
    quantity: number;
  }[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  expiresAt: Date;
  completedAt?: Date;
  signature?: string;
}

const TradeSchema = new Schema<ITrade>({
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offer: [{
    type: { type: String, required: true },
    itemId: String,
    quantity: { type: Number, default: 1 },
  }],
  request: [{
    type: { type: String, required: true },
    itemId: String,
    quantity: { type: Number, default: 1 },
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  completedAt: Date,
  signature: String,
}, {
  timestamps: true,
});

TradeSchema.index({ fromUserId: 1 });
TradeSchema.index({ toUserId: 1 });
TradeSchema.index({ status: 1, expiresAt: 1 });

export const Trade = mongoose.model<ITrade>('Trade', TradeSchema);

// ============================================
// Analytics Model
// ============================================

export interface IAnalyticsEvent extends Document {
  eventType: string;
  userId?: Schema.Types.ObjectId;
  sessionId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalyticsEvent>({
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  sessionId: String,
  data: Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

AnalyticsSchema.index({ eventType: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsSchema);

// ============================================
// Database Connection
// ============================================

export async function connectDatabase(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solana_ai_city';
  
  try {
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export default {
  User,
  City,
  Achievement,
  Quest,
  UserQuest,
  Trade,
  AnalyticsEvent,
  connectDatabase,
};
