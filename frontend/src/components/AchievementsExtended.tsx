import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// Achievement System Extended
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isSecret: boolean;
  isEarned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  canRepeat?: boolean;
  repeatCount?: number;
  chainTo?: string[]; // Achievement IDs that unlock after this
  prerequisites?: string[];
}

export type AchievementCategory =
  | 'building'      // 建筑成就
  | 'resource'     // 资源成就
  | 'population'   // 人口成就
  | 'time'         // 时间成就
  | 'social'       // 社交成就
  | 'blockchain'   // 区块链成就
  | 'special'      // 特殊成就
  | 'hidden';      // 隐藏成就

export type AchievementRarity =
  | 'common'       // 常见 - 50%
  | 'uncommon'     // 不常见 - 30%
  | 'rare'         // 稀有 - 15%
  | 'epic'         // 史诗 - 4%
  | 'legendary';    // 传说 - 1%

export interface AchievementRequirement {
  type: 'build' | 'collect' | 'reach' | 'time' | 'friend' | 'transaction' | 'nft';
  target: string;
  value: number;
  current: number;
}

export interface AchievementReward {
  type: 'gold' | 'xp' | 'tokens' | 'badge' | 'title' | 'nft' | 'unlock';
  value: number | string;
  rarity?: AchievementRarity;
}

export interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: Date;
}

export interface AchievementTitle {
  id: string;
  name: string;
  icon: string;
  unlockedAt?: Date;
  requirements: string[];
}

interface AchievementsGalleryProps {
  achievements: Achievement[];
  earnedCount: number;
  totalCount: number;
  onSelectAchievement: (achievement: Achievement) => void;
  onClaimNFT: (achievementId: string) => void;
  filter: AchievementCategory | 'all';
  sortBy: 'rarity' | 'date' | 'progress' | 'name';
}

export const AchievementsGallery: React.FC<AchievementsGalleryProps> = ({
  achievements,
  earnedCount,
  totalCount,
  onSelectAchievement,
  onClaimNFT,
  filter,
  sortBy,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const filteredAchievements = achievements
    .filter((a) => {
      if (filter !== 'all' && a.category !== filter) return false;
      if (showEarnedOnly && !a.isEarned) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      }
      if (sortBy === 'date') {
        if (!a.earnedAt && !b.earnedAt) return 0;
        if (!a.earnedAt) return 1;
        if (!b.earnedAt) return -1;
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
      }
      if (sortBy === 'progress') {
        const aProgress = a.progress || 0;
        const bProgress = b.progress || 0;
        return bProgress - aProgress;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="achievements-gallery">
      {/* Header */}
      <div className="gallery-header">
        <h2>🏆 Achievements</h2>
        <div className="gallery-stats">
          <span className="earned-count">{earnedCount}</span>
          <span className="separator">/</span>
          <span className="total-count">{totalCount}</span>
          <span className="completion-percent">
            ({Math.round((earnedCount / totalCount) * 100)}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="achievement-progress">
        <div className="progress-bar large">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="gallery-filters">
        <div className="filter-tabs">
          {(['all', 'building', 'resource', 'population', 'social', 'blockchain', 'special'] as const).map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${filter === cat ? 'active' : ''}`}
              onClick={() => {}}
            >
              {cat === 'all' && '📋 All'}
              {cat === 'building' && '🏗️ Building'}
              {cat === 'resource' && '💰 Resources'}
              {cat === 'population' && '👥 Population'}
              {cat === 'social' && '👥 Social'}
              {cat === 'blockchain' && '⛓️ Blockchain'}
              {cat === 'special' && '⭐ Special'}
            </button>
          ))}
        </div>
        
        <div className="filter-actions">
          <button
            className={`toggle-btn ${showEarnedOnly ? 'active' : ''}`}
            onClick={() => setShowEarnedOnly(!showEarnedOnly)}
          >
            {showEarnedOnly ? '🎯 Earned Only' : '📋 Show All'}
          </button>
          
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              ▦
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Achievements Grid/List */}
      <div className={`achievements-${viewMode}`}>
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => onSelectAchievement(achievement)}
          />
        ))}
      </div>

      {/* Completion Message */}
      {earnedCount === totalCount && (
        <motion.div
          className="completion-celebration"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          🎉 Congratulations! All achievements unlocked!
        </motion.div>
      )}
    </div>
  );
};

// Achievement Card
const AchievementCard: React.FC<{
  achievement: Achievement;
  onClick: () => void;
}> = ({ achievement, onClick }) => {
  const rarityColors = {
    common: '#94A3B8',
    uncommon: '#22D3EE',
    rare: '#A855F7',
    epic: '#F59E0B',
    legendary: '#FBBF24',
  };

  const progress = achievement.progress !== undefined && achievement.maxProgress !== undefined
    ? (achievement.progress / achievement.maxProgress) * 100
    : achievement.isEarned ? 100 : 0;

  return (
    <motion.div
      className={`achievement-card ${achievement.isEarned ? 'earned' : 'locked'} ${achievement.rarity}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Rarity Glow */}
      {achievement.isEarned && (
        <motion.div
          className="rarity-glow"
          animate={{
            boxShadow: [
              `0 0 20px ${rarityColors[achievement.rarity]}`,
              `0 0 40px ${rarityColors[achievement.rarity]}`,
              `0 0 20px ${rarityColors[achievement.rarity]}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Icon */}
      <div className="achievement-icon">
        {achievement.isEarned ? (
          <span className="icon">{achievement.icon}</span>
        ) : (
          <span className="icon locked">🔒</span>
        )}
      </div>

      {/* Info */}
      <div className="achievement-info">
        <div className="achievement-name">{achievement.name}</div>
        <div className="achievement-rarity">{achievement.rarity}</div>
      </div>

      {/* Progress Bar (if not earned) */}
      {!achievement.isEarned && achievement.maxProgress && (
        <div className="achievement-progress">
          <div className="mini-progress">
            <motion.div
              className="mini-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            {achievement.progress}/{achievement.maxProgress}
          </span>
        </div>
      )}

      {/* Earned Date */}
      {achievement.isEarned && achievement.earnedAt && (
        <div className="earned-date">
          {new Date(achievement.earnedAt).toLocaleDateString()}
        </div>
      )}

      {/* Rewards Preview */}
      <div className="rewards-preview">
        {achievement.rewards.slice(0, 2).map((reward, index) => (
          <span key={index} className={`reward-badge ${reward.type}`}>
            {reward.type === 'gold' && '💰'}
            {reward.type === 'xp' && '✨'}
            {reward.type === 'tokens' && '🪙'}
            {reward.type === 'nft' && '🏆'}
            {reward.type === 'title' && '👑'}
            {reward.value}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Achievement Detail Modal
export const AchievementDetailModal: React.FC<{
  achievement: Achievement;
  onClose: () => void;
  onClaimNFT: () => void;
}> = ({ achievement, onClose, onClaimNFT }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievement.isEarned && !achievement.earnedAt) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [achievement]);

  const rarityColors = {
    common: '#94A3B8',
    uncommon: '#22D3EE',
    rare: '#A855F7',
    epic: '#F59E0B',
    legendary: '#FBBF24',
  };

  return (
    <motion.div
      className="achievement-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`achievement-modal ${achievement.isEarned ? 'earned' : ''} ${achievement.rarity}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: rarityColors[achievement.rarity],
        }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              className="confetti-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="confetti"
                  initial={{ top: '50%', left: `${Math.random() * 100}%`, opacity: 1 }}
                  animate={{ top: `${100 + Math.random() * 50}%`, opacity: 0 }}
                  transition={{ duration: 2, delay: Math.random() * 0.5 }}
                  style={{
                    background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="modal-header">
          <motion.div
            className="achievement-icon large"
            animate={achievement.isEarned ? {
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.5, repeat: achievement.isEarned ? Infinity : 0, repeatDelay: 2 }}
          >
            {achievement.isEarned ? achievement.icon : '🔒'}
          </motion.div>
          <h2>{achievement.name}</h2>
          <div className={`rarity-badge ${achievement.rarity}`}>
            {achievement.rarity.toUpperCase()}
          </div>
        </div>

        <p className="modal-description">{achievement.description}</p>

        {/* Requirements */}
        <div className="requirements-section">
          <h4>📋 Requirements</h4>
          {achievement.requirements.map((req, index) => (
            <div key={index} className="requirement-item">
              <div className="req-info">
                <span className="req-type">{req.type}</span>
                <span className="req-target">{req.target}</span>
              </div>
              {achievement.isEarned ? (
                <span className="req-status completed">✓ {req.value}</span>
              ) : (
                <div className="req-progress">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (req.current / req.value) * 100)}%` }}
                    />
                  </div>
                  <span>{req.current}/{req.value}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div className="rewards-section">
          <h4>🎁 Rewards</h4>
          <div className="rewards-list">
            {achievement.rewards.map((reward, index) => (
              <div key={index} className={`reward-item ${reward.type}`}>
                <span className="reward-icon">
                  {reward.type === 'gold' && '💰'}
                  {reward.type === 'xp' && '✨'}
                  {reward.type === 'tokens' && '🪙'}
                  {reward.type === 'nft' && '🏆'}
                  {reward.type === 'title' && '👑'}
                  {reward.type === 'unlock' && '🔓'}
                </span>
                <div className="reward-info">
                  <span className="reward-type">{reward.type}</span>
                  <span className="reward-value">{reward.value}</span>
                </div>
                {reward.rarity && (
                  <span className={`reward-rarity ${reward.rarity}`}>
                    {reward.rarity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* NFT Claim */}
        {achievement.isEarned && achievement.rarity !== 'common' && (
          <button className="claim-nft-btn" onClick={onClaimNFT}>
            🏆 Mint as NFT
          </button>
        )}

        {/* Earned Info */}
        {achievement.isEarned && achievement.earnedAt && (
          <div className="earned-info">
            🎉 Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Achievement Badge Display
export const AchievementBadge: React.FC<{
  badge: AchievementBadge;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}> = ({ badge, size = 'medium', showTooltip = true }) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
  };

  return (
    <div
      className="achievement-badge"
      onMouseEnter={() => showTooltip && setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
    >
      <motion.div
        className="badge-icon"
        whileHover={{ scale: 1.1 }}
        style={{
          width: sizes[size],
          height: sizes[size],
          fontSize: sizes[size] * 0.6,
        }}
      >
        {badge.unlockedAt ? badge.icon : '🔒'}
      </motion.div>

      {showTooltipState && showTooltip && (
        <motion.div
          className="badge-tooltip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="tooltip-name">{badge.name}</div>
          <div className="tooltip-desc">{badge.description}</div>
          {badge.unlockedAt && (
            <div className="tooltip-date">
              Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Achievement Title Display
export const AchievementTitle: React.FC<{
  title: AchievementTitle;
  showIcon?: boolean;
}> = ({ title, showIcon = true }) => {
  return (
    <div className="achievement-title">
      {showIcon && <span className="title-icon">{title.icon}</span>}
      <span className="title-name">{title.name}</span>
    </div>
  );
};

// Rarity Statistics
export const RarityStats: React.FC<{
  achievements: Achievement[];
}> = ({ achievements }) => {
  const rarityCounts = {
    common: achievements.filter((a) => a.rarity === 'common').length,
    uncommon: achievements.filter((a) => a.rarity === 'uncommon').length,
    rare: achievements.filter((a) => a.rarity === 'rare').length,
    epic: achievements.filter((a) => a.rarity === 'epic').length,
    legendary: achievements.filter((a) => a.rarity === 'legendary').length,
  };

  const rarityColors = {
    common: '#94A3B8',
    uncommon: '#22D3EE',
    rare: '#A855F7',
    epic: '#F59E0B',
    legendary: '#FBBF24',
  };

  const earnedCounts = {
    common: achievements.filter((a) => a.rarity === 'common' && a.isEarned).length,
    uncommon: achievements.filter((a) => a.rarity === 'uncommon' && a.isEarned).length,
    rare: achievements.filter((a) => a.rarity === 'rare' && a.isEarned).length,
    epic: achievements.filter((a) => a.rarity === 'epic' && a.isEarned).length,
    legendary: achievements.filter((a) => a.rarity === 'legendary' && a.isEarned).length,
  };

  return (
    <div className="rarity-stats">
      {Object.entries(rarityCounts).map(([rarity, count]) => (
        <div key={rarity} className="rarity-stat">
          <div
            className="rarity-color"
            style={{ background: rarityColors[rarity as keyof typeof rarityColors] }}
          />
          <span className="rarity-name">{rarity}</span>
          <span className="rarity-count">
            {earnedCounts[rarity as keyof typeof earnedCounts]}/{count}
          </span>
        </div>
      ))}
    </div>
  );
};

export default {
  AchievementsGallery,
  AchievementDetailModal,
  AchievementBadge,
  AchievementTitle,
  RarityStats,
};
