import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface PlayerStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalBuildings: number;
  totalScore: number;
  goldEarned: number;
  buildingsConstructed: number;
  buildingsUpgraded: number;
  timePlayed: number; // in seconds
  achievementsUnlocked: number;
  totalAchievements: number;
}

interface PlayerProfileProps {
  playerId: string;
  playerName: string;
  avatar: string;
  stats: PlayerStats;
  rank: number;
  isOnline: boolean;
  lastActive: string;
}

// ============================================================================
// Constants
// ============================================================================

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000,
  64000, 128000, 256000, 512000, 1000000, 2000000, 4000000,
  8000000, 16000000, 32000000, 100000000
];

const ACHIEVEMENTS = [
  { id: 'first_building', name: 'First Steps', icon: '🏠', description: 'Build your first building' },
  { id: 'city_planner', name: 'City Planner', icon: '📐', description: 'Build 50 buildings' },
  { id: 'construction_king', name: 'Construction King', icon: '👑', description: 'Build 200 buildings' },
  { id: 'economist', name: 'Economist', icon: '💰', description: 'Earn 100,000 gold' },
  { id: 'power_player', name: 'Power Player', icon: '⚡', description: 'Build 10 power plants' },
  { id: 'farmer', name: 'Farmer', icon: '🌾', description: 'Build 20 farms' },
  { id: 'researcher', name: 'Researcher', icon: '🔬', description: 'Build 5 research labs' },
  { id: 'master_builder', name: 'Master Builder', icon: '🏗️', description: 'Upgrade 50 buildings' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function calculateLevel(experience: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ============================================================================
// PlayerProfile Component
// ============================================================================

const PlayerProfile = memo(function PlayerProfile({
  playerId,
  playerName,
  avatar,
  stats,
  rank,
  isOnline,
  lastActive,
}: PlayerProfileProps) {
  const level = calculateLevel(stats.experience);
  const progress = useMemo(() => {
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1] * 2;
    const progressInLevel = stats.experience - currentThreshold;
    const totalNeeded = nextThreshold - currentThreshold;
    return (progressInLevel / totalNeeded) * 100;
  }, [stats.experience, level]);
  
  const levelProgress = useMemo(() => {
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1] * 2;
    const progressInLevel = stats.experience - currentThreshold;
    const totalNeeded = nextThreshold - currentThreshold;
    return Math.min(100, Math.max(0, (progressInLevel / totalNeeded) * 100));
  }, [stats.experience, level]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="player-profile bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      role="region"
      aria-label={`Player profile for ${playerName}`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1"
          >
            <img
              src={avatar}
              alt={`${playerName}'s avatar`}
              className="w-full h-full rounded-full object-cover bg-slate-900"
            />
          </motion.div>
          
          {/* Online indicator */}
          {isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center"
            >
              <span className="text-xs">✓</span>
            </motion.div>
          )}
          
          {/* Level badge */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {level}
          </div>
        </div>
        
        {/* Name and Rank */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {playerName}
            {isOnline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              🏆 Rank #{rank}
            </span>
            <span className="flex items-center gap-1">
              👤 {playerId.slice(0, 8)}...
            </span>
            {!isOnline && (
              <span>Last active: {lastActive}</span>
            )}
          </div>
        </div>
        
        {/* Settings button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Player settings"
        >
          ⚙️
        </motion.button>
      </div>
      
      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Level {level}</span>
          <span className="text-sm text-slate-400">
            {formatNumber(stats.experience)} / {formatNumber(LEVEL_THRESHOLDS[level] || stats.experience * 2)} XP
          </span>
        </div>
        
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Score */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-700/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏆</span>
            <span className="text-sm text-slate-400">Total Score</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(stats.totalScore)}
          </div>
        </motion.div>
        
        {/* Buildings */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-700/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏠</span>
            <span className="text-sm text-slate-400">Buildings</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(stats.totalBuildings)}
          </div>
        </motion.div>
        
        {/* Gold Earned */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-700/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💰</span>
            <span className="text-sm text-slate-400">Gold Earned</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatNumber(stats.goldEarned)}
          </div>
        </motion.div>
        
        {/* Time Played */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-700/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏱️</span>
            <span className="text-sm text-slate-400">Time Played</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatTime(stats.timePlayed)}
          </div>
        </motion.div>
      </div>
      
      {/* Achievements Preview */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            🏅 Achievements
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
              {stats.achievementsUnlocked}/{stats.totalAchievements}
            </span>
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all →
          </motion.button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ACHIEVEMENTS.slice(0, 6).map((achievement, index) => {
            const unlocked = index < stats.achievementsUnlocked;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  unlocked
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                    : 'bg-slate-700/30 border border-slate-600 opacity-50'
                }`}
                title={`${achievement.name}: ${achievement.description}`}
              >
                {achievement.icon}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          📤 Share Profile
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          📋 Copy ID
        </motion.button>
      </div>
    </motion.div>
  );
});

export default PlayerProfile;
export type { PlayerProfileProps, PlayerStats };
