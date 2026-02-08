import express, { Request, Response } from 'express';
import { User, City, Quest, UserQuest, AnalyticsEvent } from '../models/index.js';

const router = express.Router();

// ============================================
// Get Game State
// ============================================

router.get('/state', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get city
    const city = await City.findOne({ ownerId: userId });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Get active quests
    const activeQuests = await UserQuest.find({
      userId,
      status: { $in: ['in_progress', 'completed'] },
    }).populate('questId');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        gold: user.gold,
        energy: user.energy,
        population: user.population,
        points: user.points,
        rank: user.rank,
      },
      city: {
        id: city._id,
        name: city.name,
        buildings: city.buildings,
        resources: city.resources,
        grid: city.grid,
        stats: city.stats,
      },
      quests: activeQuests.map((uq: any) => ({
        id: uq.questId._id,
        title: uq.questId.title,
        description: uq.questId.description,
        type: uq.questId.type,
        status: uq.status,
        progress: uq.progress,
        rewards: uq.questId.rewards,
      })),
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

// ============================================
// Save Game
// ============================================

router.post('/save', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { cityData, resources } = req.body;

    // Find or create city
    let city = await City.findOne({ ownerId: userId });

    if (!city) {
      city = new City({
        ownerId: userId,
        name: `${(await User.findById(userId))?.username}'s City`,
        buildings: [],
        grid: Array(10).fill(null).map(() => Array(10).fill(0)),
      });
    }

    // Update city data
    if (cityData) {
      city.buildings = cityData.buildings || [];
      city.grid = cityData.grid || city.grid;
    }

    if (resources) {
      city.resources = {
        gold: resources.gold || city.resources.gold,
        energy: resources.energy || city.resources.energy,
        population: resources.population || city.resources.population,
        tokens: resources.tokens || city.resources.tokens,
      };
    }

    city.lastSave = new Date();

    // Calculate stats
    city.stats.totalBuildings = city.buildings.length;
    city.stats.buildingsLevel = city.buildings.reduce((sum, b) => sum + b.level, 0);

    await city.save();

    // Track analytics
    await AnalyticsEvent.create({
      eventType: 'game_save',
      userId,
      data: { buildingsCount: city.buildings.length },
    });

    res.json({
      message: 'Game saved successfully',
      city: {
        id: city._id,
        name: city.name,
        stats: city.stats,
        lastSave: city.lastSave,
      },
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// ============================================
// Build Structure
// ============================================

router.post('/build', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { buildingType, position } = req.body;

    // Validate position
    if (position.x < 0 || position.x >= 10 || position.y < 0 || position.y >= 10) {
      return res.status(400).json({ error: 'Invalid position' });
    }

    // Check if tile is occupied
    const city = await City.findOne({ ownerId: userId });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const isOccupied = city.buildings.some(
      (b) => b.position.x === position.x && b.position.y === position.y
    );

    if (isOccupied) {
      return res.status(400).json({ error: 'Tile is occupied' });
    }

    // Add building
    const newBuilding = {
      id: Date.now().toString(),
      type: buildingType,
      position,
      level: 1,
      builtAt: new Date(),
    };

    city.buildings.push(newBuilding as any);
    await city.save();

    // Update user population
    await User.findByIdAndUpdate(userId, {
      $inc: {
        population: getBuildingPopulation(buildingType),
      },
    });

    res.json({
      message: 'Building constructed',
      building: newBuilding,
    });
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({ error: 'Failed to build' });
  }
});

// ============================================
// Upgrade Building
// ============================================

router.post('/upgrade', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { buildingId } = req.body;

    const city = await City.findOne({ ownerId: userId });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const building = city.buildings.find((b) => b.id === buildingId);
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // Upgrade building
    building.level += 1;
    building.upgradedAt = new Date();

    await city.save();

    res.json({
      message: 'Building upgraded',
      building: {
        id: building.id,
        type: building.type,
        level: building.level,
      },
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade' });
  }
});

// ============================================
// Demolish Building
// ============================================

router.post('/demolish', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { buildingId } = req.body;

    const city = await City.findOne({ ownerId: userId });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const buildingIndex = city.buildings.findIndex((b) => b.id === buildingId);
    if (buildingIndex === -1) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const building = city.buildings[buildingIndex];

    // Remove building
    city.buildings.splice(buildingIndex, 1);

    // Update population
    await User.findByIdAndUpdate(userId, {
      $inc: {
        population: -getBuildingPopulation(building.type),
      },
    });

    await city.save();

    res.json({
      message: 'Building demolished',
      refund: getDemolishRefund(building.type, building.level),
    });
  } catch (error) {
    console.error('Demolish error:', error);
    res.status(500).json({ error: 'Failed to demolish' });
  }
});

// ============================================
// Collect Resources
// ============================================

router.post('/collect', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { resourceType } = req.body;

    const city = await City.findOne({ ownerId: userId });
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate production
    const production = calculateResourceProduction(city.buildings, resourceType);

    // Update resources
    if (resourceType === 'gold') {
      user.gold += production;
      city.resources.gold += production;
    } else if (resourceType === 'energy') {
      user.energy = Math.min(100, user.energy + production);
      city.resources.energy = user.energy;
    }

    await user.save();
    await city.save();

    // Track analytics
    await AnalyticsEvent.create({
      eventType: 'resource_collect',
      userId,
      data: { resourceType, amount: production },
    });

    res.json({
      message: 'Resources collected',
      collected: production,
      newBalance: user.gold,
    });
  } catch (error) {
    console.error('Collect error:', error);
    res.status(500).json({ error: 'Failed to collect' });
  }
});

// ============================================
// Get Quests
// ============================================

router.get('/quests', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Get all active quests
    const quests = await Quest.find({ isActive: true }).sort({ order: 1 });

    // Get user's quest progress
    const userQuests = await UserQuest.find({ userId });

    const questProgress = new Map(
      userQuests.map((uq) => [uq.questId.toString(), uq])
    );

    res.json({
      quests: quests.map((quest) => {
        const progress = questProgress.get(quest._id.toString());
        return {
          id: quest._id,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          difficulty: quest.difficulty,
          rewards: quest.rewards,
          status: progress?.status || 'not_started',
          progress: progress?.progress || [],
        };
      }),
    });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ error: 'Failed to get quests' });
  }
});

// ============================================
// Accept Quest
// ============================================

router.post('/quests/accept', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { questId } = req.body;

    // Check if quest exists
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if already accepted
    const existing = await UserQuest.findOne({ userId, questId });
    if (existing) {
      return res.status(400).json({ error: 'Quest already accepted' });
    }

    // Create user quest
    const userQuest = new UserQuest({
      userId,
      questId,
      status: 'in_progress',
      progress: quest.requirements.map((req) => ({
        type: req.type,
        current: 0,
      })),
      startedAt: new Date(),
    });

    await userQuest.save();

    res.json({
      message: 'Quest accepted',
      quest: {
        id: quest._id,
        title: quest.title,
        requirements: quest.requirements,
      },
    });
  } catch (error) {
    console.error('Accept quest error:', error);
    res.status(500).json({ error: 'Failed to accept quest' });
  }
});

// ============================================
// Complete Quest
// ============================================

router.post('/quests/complete', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { questId } = req.body;

    const userQuest = await UserQuest.findOne({
      userId,
      questId,
      status: 'in_progress',
    }).populate('questId');

    if (!userQuest) {
      return res.status(404).json({ error: 'Quest not found or not in progress' });
    }

    // Mark as completed
    userQuest.status = 'completed';
    userQuest.completedAt = new Date();
    await userQuest.save();

    const quest = userQuest.questId as any;

    // Award rewards
    const user = await User.findById(userId);
    if (user && quest.rewards) {
      if (quest.rewards.gold) user.gold += quest.rewards.gold;
      if (quest.rewards.xp) {
        user.experience += quest.rewards.xp;
        // Check for level up
        if (user.experience >= getNextLevelXP(user.level)) {
          user.level += 1;
        }
      }
      if (quest.rewards.tokens) {
        // Add tokens
        user.markModified('tokens');
      }
      await user.save();
    }

    res.json({
      message: 'Quest completed!',
      rewards: quest.rewards,
      newLevel: user?.level,
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

// ============================================
// Helper Functions
// ============================================

function getBuildingPopulation(type: string): number {
  const populations: Record<string, number> = {
    house: 5,
    tower: 20,
    district: 50,
    shop: 0,
    bank: 0,
    office: 0,
    factory: 0,
    plant: 0,
    power: 0,
  };
  return populations[type] || 0;
}

function getDemolishRefund(type: string, level: number): number {
  const baseCosts: Record<string, number> = {
    house: 100,
    tower: 500,
    district: 2000,
    shop: 200,
    bank: 1000,
    office: 3000,
    factory: 300,
    plant: 800,
    power: 1500,
  };
  const baseCost = baseCosts[type] || 100;
  return Math.floor(baseCost * 0.5 * level);
}

function calculateResourceProduction(buildings: any[], type: string): number {
  let production = 0;
  buildings.forEach((b) => {
    if (type === 'gold') {
      production += (b.level * 5);
    } else if (type === 'energy') {
      production += (b.level * 2);
    }
  });
  return production;
}

function getNextLevelXP(level: number): number {
  return level * 1000;
}

export { router as gameRoutes };
