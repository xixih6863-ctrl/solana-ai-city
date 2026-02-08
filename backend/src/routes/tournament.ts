import express, { Request, Response } from 'express';
import { Tournament, User, Guild } from '../models/extended.js';

const router = express.Router();

// ============================================
// Tournament Routes
// ============================================

// Create Tournament (Admin)
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      name,
      description,
      type,
      category,
      rules,
      prizes,
      schedule,
    } = req.body;

    // Verify admin privileges (simplified)
    const user = await User.findById(userId);
    if (user?.level < 50) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const tournament = new Tournament({
      name,
      description,
      type,
      category,
      status: 'upcoming',
      rules,
      prizes,
      schedule: {
        registrationStart: new Date(schedule.registrationStart),
        registrationEnd: new Date(schedule.registrationEnd),
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
      },
      participants: [],
      results: [],
      createdBy: userId,
    });

    await tournament.save();

    res.status(201).json({
      message: 'Tournament created',
      tournament: {
        id: tournament._id,
        name: tournament.name,
        startDate: tournament.schedule.startDate,
      },
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Get Tournament List
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const tournaments = await Tournament.find(query)
      .sort({ 'schedule.startDate': -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-participants -results');

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

// Get Tournament Details
router.get('/:tournamentId', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const userId = (req as any).user?.userId;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.userId', 'username avatar level')
      .populate('createdBy', 'username');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if user is participating
    let userParticipation = null;
    if (userId) {
      userParticipation = tournament.participants.find(
        (p: any) => p.userId._id.toString() === userId
      );
    }

    res.json({
      tournament: {
        id: tournament._id,
        name: tournament.name,
        description: tournament.description,
        type: tournament.type,
        category: tournament.category,
        status: tournament.status,
        rules: tournament.rules,
        prizes: tournament.prizes,
        schedule: tournament.schedule,
        participantCount: tournament.participants.length,
        myParticipation: userParticipation,
        createdBy: tournament.createdBy,
      },
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ error: 'Failed to get tournament' });
  }
});

// Register for Tournament
router.post('/:tournamentId/register', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check registration window
    const now = new Date();
    if (now < tournament.schedule.registrationStart) {
      return res.status(400).json({ error: 'Registration not yet open' });
    }
    if (now > tournament.schedule.registrationEnd) {
      return res.status(400).json({ error: 'Registration closed' });
    }

    // Check if already registered
    const alreadyRegistered = tournament.participants.some(
      (p: any) => p.userId.toString() === userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Already registered' });
    }

    // Check max participants
    if (tournament.rules.maxParticipants &&
        tournament.participants.length >= tournament.rules.maxParticipants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Add participant
    tournament.participants.push({
      userId: userId as any,
      score: 0,
      rank: 0,
      submissions: 0,
      lastSubmission: null,
    });

    await tournament.save();

    res.json({ message: 'Successfully registered for tournament' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Submit Score
router.post('/:tournamentId/submit', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { tournamentId } = req.params;
    const { score } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if tournament is active
    const now = new Date();
    if (now < tournament.schedule.startDate || now > tournament.schedule.endDate) {
      return res.status(400).json({ error: 'Tournament is not active' });
    }

    // Find participant
    const participant = tournament.participants.find(
      (p: any) => p.userId.toString() === userId
    );
    if (!participant) {
      return res.status(400).json({ error: 'Not registered for this tournament' });
    }

    // Check submission limits
    const maxSubmissions = tournament.rules.category === 'building' ? 10 : 100;
    if (participant.submissions >= maxSubmissions) {
      return res.status(400).json({ error: 'Maximum submissions reached' });
    }

    // Update score (keep best score for points-based tournaments)
    if (tournament.rules.scoringType === 'points') {
      participant.score = Math.max(participant.score, score);
    } else {
      participant.score = score;
    }
    participant.submissions += 1;
    participant.lastSubmission = new Date();

    await tournament.save();

    res.json({
      message: 'Score submitted',
      newScore: participant.score,
      submissionsRemaining: maxSubmissions - participant.submissions,
    });
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Get Leaderboard
router.get('/:tournamentId/leaderboard', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.userId', 'username avatar');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Sort by score
    const sorted = [...tournament.participants].sort((a, b) => b.score - a.score);

    // Add ranks
    sorted.forEach((p: any, index) => {
      p.rank = index + 1;
    });

    const paginated = sorted.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit)
    );

    res.json({
      leaderboard: paginated.map((p: any) => ({
        rank: p.rank,
        user: p.userId,
        score: p.score,
        submissions: p.submissions,
      })),
      total: sorted.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Claim Prize
router.post('/:tournamentId/claim/:place', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { tournamentId, place } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'completed') {
      return res.status(400).json({ error: 'Tournament not completed' });
    }

    // Find result
    const result = tournament.results.find(
      (r: any) => r.userId.toString() === userId && r.place === Number(place)
    );
    if (!result) {
      return res.status(400).json({ error: 'Prize not available' });
    }

    if (result.claimed) {
      return res.status(400).json({ error: 'Prize already claimed' });
    }

    // Find prize
    const prize = tournament.prizes.find((p: any) => p.place === Number(place));
    if (!prize) {
      return res.status(400).json({ error: 'No prize for this place' });
    }

    // Mark as claimed and award prizes (simplified)
    result.claimed = true;

    // Add rewards to user (implementation would vary)
    const user = await User.findById(userId);
    if (user) {
      prize.rewards.forEach((reward: any) => {
        if (reward.type === 'gold') user.gold += reward.value;
        if (reward.type === 'tokens') user.tokens += reward.value;
      });
      await user.save();
    }

    await tournament.save();

    res.json({
      message: 'Prize claimed successfully',
      rewards: prize.rewards,
    });
  } catch (error) {
    console.error('Claim prize error:', error);
    res.status(500).json({ error: 'Failed to claim prize' });
  }
});

// End Tournament (Admin)
router.post('/:tournamentId/end', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Verify admin
    const user = await User.findById(userId);
    if (user?.level < 50) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Sort participants by score
    const sorted = [...tournament.participants].sort((a, b) => b.score - a.score);

    // Assign places and create results
    tournament.results = sorted.map((p: any, index) => ({
      userId: p.userId,
      place: index + 1,
      score: p.score,
      claimed: false,
    }));

    tournament.status = 'completed';
    await tournament.save();

    // Award guild points if guild-based
    if (tournament.rules.participationType === 'guild') {
      const topResults = tournament.results.slice(0, 3);
      for (const result of topResults) {
        const guild = await Guild.findOne({
          'members.userId': result.userId,
        });
        if (guild) {
          guild.reputation += (4 - result.place) * 100;
          await guild.save();
        }
      }
    }

    res.json({
      message: 'Tournament ended',
      results: tournament.results.slice(0, 10),
    });
  } catch (error) {
    console.error('End tournament error:', error);
    res.status(500).json({ error: 'Failed to end tournament' });
  }
});

// Get My Tournaments
router.get('/user/my', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const tournaments = await Tournament.find({
      'participants.userId': userId,
    })
      .sort({ 'schedule.endDate': -1 })
      .limit(20)
      .select('name type category status schedule prizes');

    res.json({ tournaments });
  } catch (error) {
    console.error('Get my tournaments error:', error);
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

export { router as tournamentRoutes };
