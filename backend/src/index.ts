import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Routes
import { authRoutes } from './routes/auth.js';
import { gameRoutes } from './routes/game.js';
import { walletRoutes } from './routes/wallet.js';
import { nftRoutes } from './routes/nft.js';
import { socialRoutes } from './routes/social.js';
import { analyticsRoutes } from './routes/analytics.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// Middleware
// ============================================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Health Check
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ============================================
// API Routes
// ============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// Game routes (requires authentication)
app.use('/api/game', authMiddleware, gameRoutes);

// Wallet routes (requires authentication)
app.use('/api/wallet', authMiddleware, walletRoutes);

// NFT routes (requires authentication)
app.use('/api/nfts', authMiddleware, nftRoutes);

// Social routes (requires authentication)
app.use('/api/social', authMiddleware, socialRoutes);

// Analytics routes (requires authentication)
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Public analytics
app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    totalPlayers: 1250,
    totalCities: 3420,
    totalBuildings: 45000,
    totalTrades: 12500,
    activeQuests: 340,
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
  console.log(`
🏙️ Solana AI City API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port ${PORT}
📍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health check: http://localhost:${PORT}/health
📊 API Base: http://localhost:${PORT}/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
