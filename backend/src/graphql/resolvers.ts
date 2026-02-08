import { User, City, Quest, UserQuest, Achievement, Trade, AnalyticsEvent } from '../models/index.js';
import { authenticationError, validationError } from './errors.js';

// Helper to check authentication
const requireAuth = (context: any) => {
  if (!context.user) {
    throw authenticationError('Authentication required');
  }
  return context.user;
};

export const resolvers = {
  // ============================================
  // Query Resolvers
  // ============================================

  Query: {
    // User queries
    me: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return User.findById(user.userId).populate('achievements');
    },

    user: async (_: any, { id }: { id: string }) => {
      return User.findById(id).populate('achievements');
    },

    users: async (_: any, { limit = 20, offset = 0 }: { limit: number; offset: number }) => {
      return User.find()
        .select('-__v')
        .skip(offset)
        .limit(limit)
        .sort({ points: -1 });
    },

    leaderboard: async (_: any, { limit = 10, offset = 0 }: { limit: number; offset: number }) => {
      const users = await User.find({ 'settings.showOnLeaderboard': true })
        .select('username avatar level points')
        .skip(offset)
        .limit(limit)
        .sort({ points: -1 });

      return users.map((user, index) => ({
        rank: index + 1,
        user,
        points: user.points,
        cityName: null,
        change: null,
      }));
    },

    // City queries
    myCity: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return City.findOne({ ownerId: user.userId }).populate('owner');
    },

    city: async (_: any, { id }: { id: string }) => {
      return City.findById(id).populate('owner');
    },

    publicCities: async (_: any, { limit = 20, offset = 0 }: { limit: number; offset: number }) => {
      return City.find({ 'settings.isPublic': true })
        .populate('owner')
        .skip(offset)
        .limit(limit)
        .sort({ 'stats.totalValue': -1 });
    },

    // Quest queries
    quests: async (_: any, { type }: { type?: string }) => {
      const query: any = { isActive: true };
      if (type) query.type = type;
      return Quest.find(query).sort({ order: 1 });
    },

    myQuests: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return UserQuest.find({ userId: user.userId })
        .populate('questId')
        .sort({ createdAt: -1 });
    },

    quest: async (_: any, { id }: { id: string }) => {
      return Quest.findById(id);
    },

    // Achievement queries
    achievements: async (_: any, { category }: { category?: string }) => {
      const query: any = { isActive: true };
      if (category) query.category = category;
      return Achievement.find(query);
    },

    myAchievements: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return User.findById(user.userId).then((u) => u?.achievements || []);
    },

    achievement: async (_: any, { id }: { id: string }) => {
      return Achievement.findById(id);
    },

    myNFTs: async (_: any, __: any, context: any) => {
      // This would query the blockchain for NFTs
      return [];
    },

    // Trade queries
    trades: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return Trade.find({
        $or: [{ fromUserId: user.userId }, { toUserId: user.userId }],
      }).sort({ createdAt: -1 });
    },

    pendingTrades: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return Trade.find({
        toUserId: user.userId,
        status: 'PENDING',
      }).sort({ createdAt: -1 });
    },

    // Wallet queries
    walletBalance: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      // This would query Solana
      return {
        sol: 0,
        tokens: [],
        nfts: [],
      };
    },

    // Game stats
    gameStats: async () => {
      const [totalPlayers, totalCities, totalBuildings, activeQuests, totalTrades] = await Promise.all([
        User.countDocuments(),
        City.countDocuments(),
        City.aggregate([{ $group: { _id: null, total: { $sum: '$stats.totalBuildings' } } }]),
        UserQuest.countDocuments({ status: 'IN_PROGRESS' }),
        Trade.countDocuments({ status: 'PENDING' }),
      ]);

      return {
        totalPlayers,
        totalCities,
        totalBuildings: totalBuildings[0]?.total || 0,
        activeQuests,
        totalTrades,
      };
    },
  },

  // ============================================
  // Mutation Resolvers
  // ============================================

  Mutation: {
    // Auth mutations
    register: async (_: any, { input }: { input: any }) => {
      const { walletAddress, username, email } = input;

      const existing = await User.findOne({ walletAddress });
      if (existing) {
        throw validationError('Wallet already registered');
      }

      const user = new User({
        walletAddress,
        username,
        email,
      });
      await user.save();

      const token = user.generateToken();
      return { token, user };
    },

    login: async (_: any, { walletAddress }: { walletAddress: string }) => {
      let user = await User.findOne({ walletAddress });

      if (!user) {
        throw validationError('User not found. Please register first.');
      }

      const token = user.generateToken();
      return { token, user };
    },

    updateProfile: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);

      const updateData: any = {};
      if (input.username) updateData.username = input.username;
      if (input.avatar) updateData.avatar = input.avatar;
      if (input.settings) {
        updateData.settings = { ...user.settings, ...input.settings };
      }

      return User.findByIdAndUpdate(user.userId, updateData, { new: true });
    },

    // City mutations
    build: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      const { buildingType, position } = input;

      let city = await City.findOne({ ownerId: user.userId });
      if (!city) {
        throw validationError('City not found');
      }

      // Check if tile is occupied
      const isOccupied = city.buildings.some(
        (b: any) => b.position.x === position.x && b.position.y === position.y
      );
      if (isOccupied) {
        throw validationError('Tile is occupied');
      }

      const newBuilding = {
        id: Date.now().toString(),
        type: buildingType,
        position,
        level: 1,
        builtAt: new Date(),
      };

      city.buildings.push(newBuilding as any);
      await city.save();

      return newBuilding;
    },

    upgrade: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      const { buildingId } = input;

      const city = await City.findOne({ ownerId: user.userId });
      if (!city) {
        throw validationError('City not found');
      }

      const building = city.buildings.find((b: any) => b.id === buildingId);
      if (!building) {
        throw validationError('Building not found');
      }

      building.level += 1;
      building.upgradedAt = new Date();
      await city.save();

      return building;
    },

    demolish: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      const { buildingId } = input;

      const city = await City.findOne({ ownerId: user.userId });
      if (!city) {
        throw validationError('City not found');
      }

      const index = city.buildings.findIndex((b: any) => b.id === buildingId);
      if (index === -1) {
        throw validationError('Building not found');
      }

      const building = city.buildings[index];
      city.buildings.splice(index, 1);
      await city.save();

      // Calculate refund
      const refund = Math.floor(100 * 0.5 * building.level);

      return {
        success: true,
        refund,
        message: 'Building demolished',
      };
    },

    updateCitySettings: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);

      return City.findOneAndUpdate(
        { ownerId: user.userId },
        { $set: { settings: input } },
        { new: true }
      );
    },

    collectResources: async (_: any, { type }: { type: string }, context: any) => {
      const user = requireAuth(context);

      const city = await City.findOne({ ownerId: user.userId });
      if (!city) {
        throw validationError('City not found');
      }

      // Calculate production
      let collected = 0;
      const resourceType = type.toLowerCase();

      city.buildings.forEach((b: any) => {
        if (resourceType === 'gold') {
          collected += b.level * 5;
        } else if (resourceType === 'energy') {
          collected += b.level * 2;
        }
      });

      // Update
      if (resourceType === 'gold') {
        city.resources.gold += collected;
        user.gold += collected;
      } else if (resourceType === 'energy') {
        city.resources.energy = Math.min(100, city.resources.energy + collected);
        user.energy = city.resources.energy;
      }

      await city.save();
      await user.save();

      return {
        success: true,
        collected,
        newBalance: resourceType === 'gold' ? user.gold : user.energy,
      };
    },

    // Quest mutations
    acceptQuest: async (_: any, { questId }: { questId: string }, context: any) => {
      const user = requireAuth(context);

      const quest = await Quest.findById(questId);
      if (!quest) {
        throw validationError('Quest not found');
      }

      const existing = await UserQuest.findOne({
        userId: user.userId,
        questId,
      });
      if (existing) {
        throw validationError('Quest already accepted');
      }

      const userQuest = new UserQuest({
        userId: user.userId,
        questId,
        status: 'IN_PROGRESS',
        progress: quest.requirements.map((r: any) => ({
          type: r.type,
          current: 0,
        })),
        startedAt: new Date(),
      });

      await userQuest.save();
      return userQuest.populate('questId');
    },

    completeQuest: async (_: any, { questId }: { questId: string }, context: any) => {
      const user = requireAuth(context);

      const userQuest = await UserQuest.findOne({
        userId: user.userId,
        questId,
        status: 'IN_PROGRESS',
      }).populate('questId');

      if (!userQuest) {
        throw validationError('Quest not in progress');
      }

      // Check if all requirements met
      const quest = userQuest.questId as any;
      const allMet = quest.requirements.every((req: any, index: number) => {
        const progress = userQuest.progress[index];
        return progress.current >= req.value;
      });

      if (!allMet) {
        throw validationError('Quest requirements not met');
      }

      userQuest.status = 'COMPLETED';
      userQuest.completedAt = new Date();
      await userQuest.save();

      // Award rewards
      const rewards = quest.rewards;
      let leveledUp = false;

      if (rewards.gold) user.gold += rewards.gold;
      if (rewards.xp) {
        user.experience += rewards.xp;
        const nextLevelXP = user.level * 1000;
        if (user.experience >= nextLevelXP) {
          user.level += 1;
          leveledUp = true;
        }
      }

      await user.save();

      return {
        success: true,
        rewards,
        leveledUp,
        newLevel: leveledUp ? user.level : null,
      };
    },

    claimQuestReward: async (_: any, { questId }: { questId: string }, context: any) => {
      const user = requireAuth(context);

      const userQuest = await UserQuest.findOne({
        userId: user.userId,
        questId,
        status: 'COMPLETED',
      }).populate('questId');

      if (!userQuest) {
        throw validationError('Quest not completed');
      }

      userQuest.status = 'CLAIMED';
      userQuest.claimedAt = new Date();
      await userQuest.save();

      return userQuest;
    },

    // Trade mutations
    createTrade: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      const { toUserId, offer, request, expiresInHours = 24 } = input;

      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      const trade = new Trade({
        fromUserId: user.userId,
        toUserId,
        offer,
        request,
        status: 'PENDING',
        expiresAt,
      });

      await trade.save();
      return trade;
    },

    acceptTrade: async (_: any, { tradeId }: { tradeId: string }, context: any) => {
      const user = requireAuth(context);

      const trade = await Trade.findOne({
        _id: tradeId,
        toUserId: user.userId,
        status: 'PENDING',
      });

      if (!trade) {
        throw validationError('Trade not found or not pending');
      }

      // Execute trade (simplified)
      trade.status = 'ACCEPTED';
      trade.completedAt = new Date();
      await trade.save();

      return trade;
    },

    rejectTrade: async (_: any, { tradeId }: { tradeId: string }, context: any) => {
      const user = requireAuth(context);

      const trade = await Trade.findOneAndUpdate(
        { _id: tradeId, toUserId: user.userId, status: 'PENDING' },
        { status: 'REJECTED' },
        { new: true }
      );

      if (!trade) {
        throw validationError('Trade not found');
      }

      return trade;
    },

    cancelTrade: async (_: any, { tradeId }: { tradeId: string }, context: any) => {
      const user = requireAuth(context);

      const trade = await Trade.findOneAndUpdate(
        { _id: tradeId, fromUserId: user.userId, status: 'PENDING' },
        { status: 'CANCELLED' },
        { new: true }
      );

      if (!trade) {
        throw validationError('Trade not found');
      }

      return trade;
    },

    // Wallet mutations
    syncWallet: async (_: any, { walletAddress }: { walletAddress: string }, context: any) => {
      const user = requireAuth(context);

      return User.findByIdAndUpdate(
        user.userId,
        { walletAddress },
        { new: true }
      );
    },

    requestAirdrop: async (_: any, { amount = 2 }: { amount: number }, context: any) => {
      const user = requireAuth(context);

      // This would call Solana RPC
      return {
        success: true,
        signature: 'signature_placeholder',
        message: 'Airdrop requested (devnet only)',
      };
    },

    // NFT mutations
    mintAchievement: async (_: any, { achievementId }: { achievementId: string }, context: any) => {
      const user = requireAuth(context);

      // This would mint on Solana via Metaplex
      return {
        id: Date.now().toString(),
        achievement: await Achievement.findById(achievementId),
        mintedAt: new Date(),
        metadata: {},
        transactionSignature: 'signature_placeholder',
      };
    },
  },

  // ============================================
  // Field Resolvers
  // ============================================

  User: {
    city: async (parent: any) => {
      return City.findOne({ ownerId: parent.id });
    },
    achievements: async (parent: any) => {
      // This would fetch from achievements collection
      return [];
    },
  },

  City: {
    owner: async (parent: any) => {
      return User.findById(parent.ownerId);
    },
  },

  UserQuest: {
    quest: async (parent: any) => {
      return Quest.findById(parent.questId);
    },
  },
};

export default resolvers;
