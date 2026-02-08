import express, { Request, Response } from 'express';
import { Guild, Tournament, User } from '../models/extended.js';

const router = express.Router();

// ============================================
// Guild Routes
// ============================================

// Create Guild
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, tag, description } = req.body;

    // Check if user is already in a guild
    const existingGuild = await Guild.findOne({
      'members.userId': userId,
    });
    if (existingGuild) {
      return res.status(400).json({ error: 'Already in a guild' });
    }

    // Check tag uniqueness
    const tagExists = await Guild.findOne({ tag: tag.toUpperCase() });
    if (tagExists) {
      return res.status(400).json({ error: 'Tag already taken' });
    }

    const guild = new Guild({
      name,
      tag: tag.toUpperCase(),
      description,
      leaderId: userId,
      members: [{
        userId,
        role: 'leader',
        joinedAt: new Date(),
        contributions: 0,
        lastActive: new Date(),
      }],
    });

    await guild.save();

    // Update user's guild reference would go here

    res.status(201).json({
      message: 'Guild created successfully',
      guild: {
        id: guild._id,
        name: guild.name,
        tag: guild.tag,
      },
    });
  } catch (error) {
    console.error('Create guild error:', error);
    res.status(500).json({ error: 'Failed to create guild' });
  }
});

// Get Guild Info
router.get('/:guildId', async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;
    const guild = await Guild.findById(guildId)
      .populate('members.userId', 'username avatar level points');

    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    res.json({
      guild: {
        id: guild._id,
        name: guild.name,
        tag: guild.tag,
        description: guild.description,
        level: guild.level,
        reputation: guild.reputation,
        memberCount: guild.members.length,
        settings: guild.settings,
        stats: guild.stats,
        leader: guild.members.find((m: any) => m.role === 'leader')?.userId,
        officers: guild.members.filter((m: any) => m.role === 'officer').map((m: any) => m.userId),
      },
    });
  } catch (error) {
    console.error('Get guild error:', error);
    res.status(500).json({ error: 'Failed to get guild' });
  }
});

// Get Guild Leaderboard
router.get('/leaderboard/top', async (req: Response) => {
  try {
    const guilds = await Guild.find({ 'settings.isPublic': true })
      .sort({ reputation: -1 })
      .limit(10)
      .select('name tag reputation level memberCount');

    res.json({ guilds });
  } catch (error) {
    console.error('Guild leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Join Guild
router.post('/:guildId/join', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { guildId } = req.params;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    if (!guild.settings.allowJoin) {
      return res.status(400).json({ error: 'Guild is not accepting new members' });
    }

    if (guild.members.length >= guild.settings.maxMembers) {
      return res.status(400).json({ error: 'Guild is full' });
    }

    // Check level requirement
    const user = await User.findById(userId);
    if (user && user.level < guild.settings.minLevel) {
      return res.status(400).json({
        error: `Minimum level ${guild.settings.minLevel} required`,
      });
    }

    // Check if already in guild
    const alreadyMember = guild.members.some(
      (m: any) => m.userId.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ error: 'Already in this guild' });
    }

    guild.members.push({
      userId: userId as any,
      role: 'member',
      joinedAt: new Date(),
      contributions: 0,
      lastActive: new Date(),
    });

    await guild.save();

    res.json({ message: 'Joined guild successfully' });
  } catch (error) {
    console.error('Join guild error:', error);
    res.status(500).json({ error: 'Failed to join guild' });
  }
});

// Leave Guild
router.post('/:guildId/leave', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { guildId } = req.params;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Cannot leave if leader
    if (guild.leaderId.toString() === userId) {
      return res.status(400).json({ error: 'Leader cannot leave. Transfer ownership first.' });
    }

    guild.members = guild.members.filter(
      (m: any) => m.userId.toString() !== userId
    );

    await guild.save();

    res.json({ message: 'Left guild successfully' });
  } catch (error) {
    console.error('Leave guild error:', error);
    res.status(500).json({ error: 'Failed to leave guild' });
  }
});

// Update Guild Settings (Leader/Officer only)
router.put('/:guildId/settings', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { guildId } = req.params;
    const { description, isPublic, minLevel, maxMembers, allowJoin } = req.body;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const member = guild.members.find((m: any) => m.userId.toString() === userId);
    if (!member || !['leader', 'officer'].includes(member.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (description !== undefined) guild.description = description;
    if (isPublic !== undefined) guild.settings.isPublic = isPublic;
    if (minLevel !== undefined) guild.settings.minLevel = minLevel;
    if (maxMembers !== undefined) guild.settings.maxMembers = maxMembers;
    if (allowJoin !== undefined) guild.settings.allowJoin = allowJoin;

    await guild.save();

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Guild Contributions
router.post('/:guildId/contribute', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { guildId } = req.params;
    const { amount, type } = req.body;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const member = guild.members.find((m: any) => m.userId.toString() === userId);
    if (!member) {
      return res.status(400).json({ error: 'Not a member of this guild' });
    }

    // Update contributions
    member.contributions += amount;
    guild.resources[type] = (guild.resources[type] || 0) + amount;
    guild.stats.totalGold += type === 'gold' ? amount : 0;

    await guild.save();

    res.json({
      message: 'Contribution added',
      newContributions: member.contributions,
      guildResources: guild.resources,
    });
  } catch (error) {
    console.error('Contribute error:', error);
    res.status(500).json({ error: 'Failed to contribute' });
  }
});

// Get Guild Members
router.get('/:guildId/members', async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const guild = await Guild.findById(guildId)
      .populate('members.userId', 'username avatar level points achievements');

    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const members = guild.members.map((m: any) => ({
      user: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      contributions: m.contributions,
      lastActive: m.lastActive,
    }));

    res.json({
      members,
      total: members.length,
      page: Number(page),
      pages: Math.ceil(members.length / Number(limit)),
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

// Search Guilds
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, minLevel, isPublic } = req.query;

    const query: any = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { tag: { $regex: q, $options: 'i' } },
      ];
    }
    if (minLevel) query['settings.minLevel'] = { $lte: Number(minLevel) };
    if (isPublic !== undefined) query['settings.isPublic'] = isPublic === 'true';

    const guilds = await Guild.find(query)
      .sort({ reputation: -1 })
      .limit(20)
      .select('name tag description level reputation memberCount settings.minLevel');

    res.json({ guilds });
  } catch (error) {
    console.error('Search guilds error:', error);
    res.status(500).json({ error: 'Failed to search guilds' });
  }
});

export { router as guildRoutes };
