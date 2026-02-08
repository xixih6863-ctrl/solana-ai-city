import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ============================================
// Register / Create User
// ============================================

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { walletAddress, username } = req.body;

    if (!walletAddress || !username) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'walletAddress and username are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({
        error: 'User exists',
        message: 'This wallet is already registered',
      });
    }

    // Create user
    const user = new User({
      walletAddress,
      username,
      level: 1,
      experience: 0,
      gold: 1000,
      energy: 100,
      population: 0,
      points: 0,
      rank: 0,
      achievements: [],
      friends: [],
      settings: {
        notifications: true,
        publicProfile: true,
        showOnLeaderboard: true,
      },
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        level: user.level,
        points: user.points,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration',
    });
  }
});

// ============================================
// Login / Get Token
// ============================================

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'Missing wallet address',
        message: 'walletAddress is required',
      });
    }

    // Find user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found for this wallet',
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, walletAddress },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        level: user.level,
        points: user.points,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login',
    });
  }
});

// ============================================
// Get User Profile
// ============================================

router.get('/profile', async (req: Request, res: Response) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId)
      .select('-__v')
      .populate('friends', 'username avatar level points');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    res.json({
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        gold: user.gold,
        energy: user.energy,
        population: user.population,
        points: user.points,
        rank: user.rank,
        achievements: user.achievements,
        friendsCount: user.friends.length,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'An error occurred while fetching profile',
    });
  }
});

// ============================================
// Update User Profile
// ============================================

router.put('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { username, avatar, settings } = req.body;

    const updateData: Partial<IUser> = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = { ...settings };

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found',
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'An error occurred while updating profile',
    });
  }
});

// ============================================
// Verify Token
// ============================================

router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        valid: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        valid: false,
        error: 'User not found',
      });
    }

    res.json({
      valid: true,
      userId: decoded.userId,
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token',
    });
  }
});

// ============================================
// Refresh Token
// ============================================

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'refreshToken is required',
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    
    const newToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: newToken,
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Token refresh failed',
    });
  }
});

export { router as authRoutes };
