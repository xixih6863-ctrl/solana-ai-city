/**
 * Solana AI City - Leaderboard Component
 * 
 * Displays player rankings with animations and accessibility
 * WCAG AA compliant
 */

import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'allTime';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  cityName: string;
  avatar?: string;
  score: number;
  level: number;
  population: number;
  buildings: number;
  country?: string;
  lastActive: Date;
}

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  timeframe: LeaderboardTimeframe;
  onTimeframeChange: (timeframe: LeaderboardTimeframe) => void;
  isLoading?: boolean;
}

// ============================================================================
// Default Mock Data
// ============================================================================

const DEFAULT_ENTRIES: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'player-1',
    playerName: 'CryptoKing',
    cityName: 'Metropolis',
    avatar: '👑',
    score: 15420,
    level: 25,
    population: 5000,
    buildings: 150,
    country: '🇺🇸',
    lastActive: new Date(),
  },
  {
    rank: 2,
    playerId: 'player-2',
    playerName: 'SolanaBuilder',
    cityName: 'Sunrise City',
    avatar: '🌅',
    score: 12350,
    level: 22,
    population: 4200,
    buildings: 120,
    country: '🇯🇵',
    lastActive: new Date(),
  },
  {
    rank: 3,
    playerId: 'player-3',
    playerName: 'DeFiMaster',
    cityName: 'Fortune Town',
    avatar: '💎',
    score: 11200,
    level: 20,
    population: 3800,
    buildings: 100,
    country: '🇬🇧',
    lastActive: new Date(),
  },
  {
    rank: 4,
    playerId: 'player-4',
    playerName: 'Web3Ninja',
    cityName: 'Shadow Valley',
    avatar: '🥷',
    score: 9800,
    level: 18,
    population: 3200,
    buildings: 85,
    country: '🇰🇷',
    lastActive: new Date(),
  },
  {
    rank: 5,
    playerId: 'player-5',
    playerName: 'GamerPro',
    cityName: 'Victory Hills',
    avatar: '🎮',
    score: 8500,
    level: 16,
    population: 2800,
    buildings: 75,
    country: '🇨🇳',
    lastActive: new Date(),
  },
];

// ============================================================================
// Animations
// ============================================================================

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
};

const podiumVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

// ============================================================================
// Podium Component (Top 3)
// ============================================================================

const Podium = memo(function Podium({ 
  entries,
  currentPlayerId 
}: { 
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
}) {
  const top3 = entries.slice(0, 3);
  
  // Reorder for podium (2nd, 1st, 3rd)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  
  return (
    <div className="podium" role="list" aria-label="Top 3 players">
      {podiumOrder.map((entry, index) => {
        const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3;
        const height = index === 1 ? 'h-32' : index === 0 ? 'h-28' : 'h-24';
        const medal = index === 1 ? '🥇' : index === 0 ? '🥈' : '🥉';
        const isCurrentPlayer = entry.playerId === currentPlayerId;
        
        return (
          <motion.div
            key={entry.playerId}
            className={[
              'podium-item',
              height,
              isCurrentPlayer ? 'current-player' : '',
            ].join(' ')}
            variants={podiumVariants}
            initial="hidden"
            animate="visible"
            role="listitem"
            aria-label={`Rank ${actualRank}: ${entry.playerName}`}
          >
            <motion.div 
              className="podium-avatar"
              whileHover={{ scale: 1.1 }}
            >
              <span className="avatar-icon" aria-hidden="true">
                {entry.avatar || '🏆'}
              </span>
              <span className="medal" aria-hidden="true">
                {medal}
              </span>
            </motion.div>
            
            <h4 className="podium-name">{entry.playerName}</h4>
            
            <div className="podium-score">
              <span className="score-value">{formatNumber(entry.score)}</span>
              <span className="score-label">pts</span>
            </div>
            
            {isCurrentPlayer && (
              <span className="you-badge">YOU</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
});

// ============================================================================
// Leaderboard Item Component
// ============================================================================

const LeaderboardItem = memo(function LeaderboardItem({ 
  entry,
  isCurrentPlayer 
}: { 
  entry: LeaderboardEntry;
  isCurrentPlayer: boolean;
}) {
  const medal = entry.rank <= 3 ? ['', '🥇', '🥈', '🥉'][entry.rank] : '';
  
  return (
    <motion.div
      className={[
        'leaderboard-item',
        isCurrentPlayer ? 'current-player' : '',
        entry.rank <= 3 ? 'top-3' : '',
      ].join(' ')}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      role="listitem"
      aria-label={`Rank ${entry.rank}: ${entry.playerName} with ${formatNumber(entry.score)} points`}
    >
      {/* Rank */}
      <div className="item-rank">
        {medal || <span>{entry.rank}</span>}
      </div>
      
      {/* Avatar */}
      <div className="item-avatar" aria-hidden="true">
        {entry.avatar || '👤'}
      </div>
      
      {/* Info */}
      <div className="item-info">
        <h4 className="item-name">
          {entry.cityName}
          {entry.country && (
            <span className="country" aria-label={entry.country}>
              {entry.country}
            </span>
          )}
        </h4>
        <p className="item-player">by {entry.playerName}</p>
      </div>
      
      {/* Stats */}
      <div className="item-stats">
        <div className="stat">
          <span className="stat-value">{entry.level}</span>
          <span className="stat-label">Lvl</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatNumber(entry.population)}</span>
          <span className="stat-label">Pop</span>
        </div>
        <div className="stat">
          <span className="stat-value">{entry.buildings}</span>
          <span className="stat-label">Bldg</span>
        </div>
      </div>
      
      {/* Score */}
      <div className="item-score">
        <span className="score-value">{formatNumber(entry.score)}</span>
        <span className="score-label">pts</span>
      </div>
      
      {/* Last Active */}
      <div className="item-last-active">
        {formatTimeAgo(entry.lastActive)}
      </div>
    </motion.div>
  );
});

// ============================================================================
// Main Leaderboard Component
// ============================================================================

const Leaderboard = memo(function Leaderboard({
  entries = DEFAULT_ENTRIES,
  currentPlayerId,
  timeframe,
  onTimeframeChange,
  isLoading = false,
}: LeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter entries based on search
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    
    const query = searchQuery.toLowerCase();
    return entries.filter(entry =>
      entry.playerName.toLowerCase().includes(query) ||
      entry.cityName.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);
  
  // Group entries
  const top3 = useMemo(() => filteredEntries.slice(0, 3), [filteredEntries]);
  const rest = useMemo(() => filteredEntries.slice(3), [filteredEntries]);
  
  return (
    <section 
      className="leaderboard"
      role="region"
      aria-label="Player Leaderboard"
    >
      {/* Header */}
      <header className="leaderboard-header">
        <div className="header-content">
          <h2 className="leaderboard-title">
            <span className="trophy-icon" aria-hidden="true">🏆</span>
            Leaderboard
          </h2>
          <p className="leaderboard-subtitle">
            Top {entries.length} players this {timeframe}
          </p>
        </div>
        
        {/* Search */}
        <div className="search-container">
          <label htmlFor="leaderboard-search" className="sr-only">
            Search players
          </label>
          <input
            id="leaderboard-search"
            type="search"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-describedby="search-hint"
          />
          <span id="search-hint" className="sr-only">
            Type to filter leaderboard by player name or city name
          </span>
        </div>
        
        {/* Timeframe Selector */}
        <div 
          className="timeframe-selector"
          role="tablist"
          aria-label="Leaderboard timeframe"
        >
          {(['daily', 'weekly', 'monthly', 'allTime'] as LeaderboardTimeframe[]).map((tf) => (
            <motion.button
              key={tf}
              className={[
                'timeframe-tab',
                timeframe === tf ? 'active' : '',
              ].join(' ')}
              onClick={() => onTimeframeChange(tf)}
              role="tab"
              aria-selected={timeframe === tf}
              aria-controls={`panel-${tf}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tf === 'daily' && '📅'}
              {tf === 'weekly' && '📆'}
              {tf === 'monthly' && '🗓️'}
              {tf === 'allTime' && '🏆'}
              <span className="tab-label">{tf}</span>
            </motion.button>
          ))}
        </div>
      </header>
      
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner" aria-label="Loading leaderboard" />
            <p>Loading...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Podium (Top 3) */}
      {!isLoading && (
        <motion.div 
          className="leaderboard-podium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Podium entries={top3} currentPlayerId={currentPlayerId} />
        </motion.div>
      )}
      
      {/* List (Rest of entries) */}
      {!isLoading && (
        <motion.div
          className="leaderboard-list"
          variants={listVariants}
          initial="hidden"
          animate="visible"
          role="list"
          aria-label="Leaderboard entries"
        >
          {rest.map((entry) => (
            <LeaderboardItem
              key={entry.playerId}
              entry={entry}
              isCurrentPlayer={entry.playerId === currentPlayerId}
            />
          ))}
          
          {rest.length === 0 && searchQuery && (
            <motion.div 
              className="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="no-results-icon" aria-hidden="true">🔍</span>
              <p>No players found</p>
              <p className="no-results-hint">
                Try a different search term
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Footer */}
      <footer className="leaderboard-footer">
        <p className="footer-info">
          Showing {filteredEntries.length} of {entries.length} players
        </p>
        <motion.button
          className="view-all-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="View full leaderboard"
        >
          View Full Leaderboard →
        </motion.button>
      </footer>
    </section>
  );
});

// ============================================================================
// Export
// ============================================================================

export default Leaderboard;
export type { LeaderboardEntry, LeaderboardProps, LeaderboardTimeframe };
