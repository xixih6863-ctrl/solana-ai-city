import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  reward?: {
    type: 'gold' | 'xp' | 'badge' | 'title';
    value: number | string;
  };
}

type AchievementCategory = 
  | 'building' 
  | 'resource' 
  | 'social' 
  | 'special' 
  | 'milestone';

interface AchievementsPanelProps {
  achievements: Achievement[];
  onSelectAchievement: (achievement: Achievement) => void;
  onClose: () => void;
  isOpen: boolean;
}

// ============================================================================
// Achievement Data
// ============================================================================

const ALL_ACHIEVEMENTS: Achievement[] = [
  // Building achievements
  {
    id: 'first_building',
    name: 'First Steps',
    description: 'Build your first building',
    icon: '🏠',
    category: 'building',
    rarity: 'common',
    requirement: 'Build 1 building',
    progress: 0,
    maxProgress: 1,
    reward: { type: 'gold', value: 100 },
  },
  {
    id: 'city_planner',
    name: 'City Planner',
    description: 'Build 50 buildings',
    icon: '📐',
    category: 'building',
    rarity: 'rare',
    requirement: 'Build 50 buildings',
    progress: 0,
    maxProgress: 50,
    reward: { type: 'gold', value: 5000 },
  },
  {
    id: 'construction_king',
    name: 'Construction King',
    description: 'Build 200 buildings',
    icon: '👑',
    category: 'building',
    rarity: 'epic',
    requirement: 'Build 200 buildings',
    progress: 0,
    maxProgress: 200,
    reward: { type: 'title', value: 'Construction King' },
  },
  {
    id: 'metropolis',
    name: 'Metropolis',
    description: 'Build 500 buildings',
    icon: '🏙️',
    category: 'building',
    rarity: 'legendary',
    requirement: 'Build 500 buildings',
    progress: 0,
    maxProgress: 500,
    reward: { type: 'badge', value: 'metropolis' },
  },
  
  // Resource achievements
  {
    id: 'gold_rush',
    name: 'Gold Rush',
    description: 'Earn 100,000 gold',
    icon: '💰',
    category: 'resource',
    rarity: 'rare',
    requirement: 'Earn 100,000 gold',
    progress: 0,
    maxProgress: 100000,
    reward: { type: 'gold', value: 10000 },
  },
  {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Earn 1,000,000 gold',
    icon: '💎',
    category: 'resource',
    rarity: 'epic',
    requirement: 'Earn 1,000,000 gold',
    progress: 0,
    maxProgress: 1000000,
    reward: { type: 'badge', value: 'treasure_hunter' },
  },
  
  // Power achievements
  {
    id: 'power_plant',
    name: 'Power Player',
    description: 'Build 10 power plants',
    icon: '⚡',
    category: 'building',
    rarity: 'rare',
    requirement: 'Build 10 power plants',
    progress: 0,
    maxProgress: 10,
    reward: { type: 'xp', value: 500 },
  },
  {
    id: 'energy_tycoon',
    name: 'Energy Tycoon',
    description: 'Build 50 power plants',
    icon: '🔋',
    category: 'building',
    rarity: 'epic',
    requirement: 'Build 50 power plants',
    progress: 0,
    maxProgress: 50,
    reward: { type: 'badge', value: 'energy_tycoon' },
  },
  
  // Farm achievements
  {
    id: 'farmer',
    name: 'Farmer',
    description: 'Build 20 farms',
    icon: '🌾',
    category: 'building',
    rarity: 'common',
    requirement: 'Build 20 farms',
    progress: 0,
    maxProgress: 20,
    reward: { type: 'gold', value: 2000 },
  },
  {
    id: 'agribusiness',
    name: 'Agribusiness',
    description: 'Build 100 farms',
    icon: '🚜',
    category: 'building',
    rarity: 'rare',
    requirement: 'Build 100 farms',
    progress: 0,
    maxProgress: 100,
    reward: { type: 'title', value: 'Master Farmer' },
  },
  
  // Research achievements
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Build 5 research labs',
    icon: '🔬',
    category: 'building',
    rarity: 'rare',
    requirement: 'Build 5 research labs',
    progress: 0,
    maxProgress: 5,
    reward: { type: 'xp', value: 1000 },
  },
  {
    id: 'scientist',
    name: 'Scientist',
    description: 'Build 25 research labs',
    icon: '🧪',
    category: 'building',
    rarity: 'epic',
    requirement: 'Build 25 research labs',
    progress: 0,
    maxProgress: 25,
    reward: { type: 'badge', value: 'scientist' },
  },
  
  // Special achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join the game in the first week',
    icon: '🚀',
    category: 'special',
    rarity: 'rare',
    requirement: 'Join during launch week',
    unlockedAt: new Date().toISOString(),
    reward: { type: 'badge', value: 'early_adopter' },
  },
  {
    id: 'dedicated',
    name: 'Dedicated Player',
    description: 'Play for 100 hours',
    icon: '⏰',
    category: 'milestone',
    rarity: 'rare',
    requirement: 'Play for 100 hours',
    progress: 0,
    maxProgress: 100,
    reward: { type: 'xp', value: 5000 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play for 500 hours',
    icon: '🎖️',
    category: 'milestone',
    rarity: 'epic',
    requirement: 'Play for 500 hours',
    progress: 0,
    maxProgress: 500,
    reward: { type: 'title', value: 'Veteran' },
  },
  {
    id: 'master',
    name: 'City Master',
    description: 'Reach level 50',
    icon: '🏆',
    category: 'milestone',
    rarity: 'legendary',
    requirement: 'Reach level 50',
    progress: 0,
    maxProgress: 50,
    reward: { type: 'badge', value: 'city_master' },
  },
];

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES: { value: AchievementCategory; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'building', label: 'Building', icon: '🏗️' },
  { value: 'resource', label: 'Resources', icon: '💰' },
  { value: 'special', label: 'Special', icon: '⭐' },
  { value: 'milestone', label: 'Milestones', icon: '🎯' },
];

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-slate-700/50', border: 'border-slate-500', text: 'text-slate-300', glow: 'shadow-slate-500/20' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-300', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-300', glow: 'shadow-purple-500/20' },
  legendary: { bg: 'bg-yellow-500/20', border: 'border-yellow-400', text: 'text-yellow-300', glow: 'shadow-yellow-500/20' },
};

// ============================================================================
// AchievementsPanel Component
// ============================================================================

const AchievementsPanel = memo(function AchievementsPanel({
  achievements = ALL_ACHIEVEMENTS,
  onSelectAchievement,
  onClose,
  isOpen,
}: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rarity' | 'progress' | 'date'>('rarity');
  
  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let result = [...achievements];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }
    
    // Filter by unlocked status
    if (showUnlockedOnly) {
      result = result.filter(a => a.unlockedAt);
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      }
      if (sortBy === 'progress') {
        const aProgress = a.progress || (a.unlockedAt ? 100 : 0);
        const bProgress = b.progress || (b.unlockedAt ? 100 : 0);
        return bProgress - aProgress;
      }
      // Sort by date (unlocked first)
      if (a.unlockedAt && b.unlockedAt) {
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      }
      if (a.unlockedAt) return -1;
      if (b.unlockedAt) return 1;
      return 0;
    });
    
    return result;
  }, [achievements, selectedCategory, showUnlockedOnly, sortBy]);
  
  // Stats
  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.unlockedAt).length;
    const total = achievements.length;
    const completion = Math.round((unlocked / total) * 100);
    
    return { unlocked, total, completion };
  }, [achievements]);
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              🏅 Achievements
              <span className="text-lg font-normal text-slate-400">
                {stats.unlocked}/{stats.total} ({stats.completion}%)
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Progress Ring */}
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#334155"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${stats.completion * 1.26} 126`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </div>
        
        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-700 p-4 space-y-2 overflow-y-auto">
            {CATEGORIES.map((category) => {
              const count = category.value === 'all' 
                ? achievements.length 
                : achievements.filter(a => a.category === category.value).length;
              const unlocked = category.value === 'all'
                ? stats.unlocked
                : achievements.filter(a => a.category === category.value && a.unlockedAt).length;
              
              return (
                <motion.button
                  key={category.value}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs opacity-60">
                      {unlocked}/{count} unlocked
                    </div>
                  </div>
                </motion.button>
              );
            })}
            
            {/* Filters */}
            <div className="pt-4 mt-4 border-t border-slate-700">
              <h3 className="px-4 mb-2 text-sm font-semibold text-slate-400">Filters</h3>
              
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  showUnlockedOnly
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>{showUnlockedOnly ? '✅' : '⬜'}</span>
                <span>Unlocked only</span>
              </motion.button>
              
              <div className="mt-4">
                <label className="px-4 mb-2 text-sm font-semibold text-slate-400 block">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="rarity">Rarity</option>
                  <option value="progress">Progress</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Achievement Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => {
                const isUnlocked = !!achievement.unlockedAt;
                const progress = achievement.progress || 0;
                const maxProgress = achievement.maxProgress || 1;
                const progressPercent = Math.min(100, (progress / maxProgress) * 100);
                const colors = RARITY_COLORS[achievement.rarity];
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onSelectAchievement(achievement)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                      isUnlocked
                        ? `${colors.bg} ${colors.border}`
                        : 'bg-slate-800/50 border-slate-700 opacity-60'
                    } ${colors.glow} shadow-lg`}
                  >
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                        isUnlocked
                          ? 'bg-white/10'
                          : 'bg-slate-700/50'
                      }`}>
                        {achievement.icon}
                      </div>
                      
                      {isUnlocked && (
                        <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <h3 className={`font-bold ${isUnlocked ? colors.text : 'text-slate-500'}`}>
                      {achievement.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {achievement.description}
                    </p>
                    
                    {/* Progress Bar */}
                    {!isUnlocked && achievement.maxProgress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{progress}/{maxProgress}</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Unlocked Date */}
                    {isUnlocked && achievement.unlockedAt && (
                      <div className="mt-3 text-xs text-slate-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Rarity Badge */}
                    <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isUnlocked
                        ? `${colors.bg} ${colors.text}`
                        : 'bg-slate-700 text-slate-500'
                    }`}>
                      {achievement.rarity}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {filteredAchievements.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <span className="text-4xl mb-4">🔍</span>
                <p>No achievements found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default AchievementsPanel;
export type { Achievement, AchievementCategory, AchievementsPanelProps };
