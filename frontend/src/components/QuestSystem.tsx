import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatNumber } from '../utils/format';

// ============================================
// Quest System
// ============================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'challenge' | 'community';
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'claimed';
  difficulty: 1 | 2 | 3 | 4 | 5;
  rewards: {
    gold?: number;
    xp?: number;
    tokens?: number;
    nft?: {
      name: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    };
    items?: { name: string; quantity: number }[];
  };
  requirements: {
    type: 'build' | 'collect' | 'reach' | 'trade' | 'friend' | 'time';
    target: string;
    current: number;
    targetValue: number;
  }[];
  timeLimit?: number; // seconds
  expiresAt?: number;
  chainTo?: string; // Next quest ID
  prerequisites?: string[]; // Required quest IDs
  storyChapter?: number;
  repeatable?: boolean;
  repeatableCooldown?: number; // hours
}

interface QuestPanelProps {
  quests: Quest[];
  activeQuest?: Quest;
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onClaimReward: (questId: string) => void;
  onAbandonQuest: (questId: string) => void;
  onViewQuest: (questId: string) => void;
  onNavigateToQuest?: (questId: string) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({
  quests,
  activeQuest,
  onAcceptQuest,
  onCompleteQuest,
  onClaimReward,
  onAbandonQuest,
  onViewQuest,
  onNavigateToQuest,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'story' | 'challenges'>('daily');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const filterQuests = (status?: Quest['status']) => {
    return quests.filter((q) => {
      if (activeTab === 'daily' && q.type !== 'daily') return false;
      if (activeTab === 'weekly' && q.type !== 'weekly') return false;
      if (activeTab === 'story' && q.type !== 'story') return false;
      if (activeTab === 'challenges' && !['challenge', 'community'].includes(q.type)) return false;
      if (status && q.status !== status) return false;
      return true;
    });
  };

  const tabs = [
    { id: 'daily', label: '📅 Daily', count: filterQuests('available').length },
    { id: 'weekly', label: '📆 Weekly', count: filterQuests('available').length },
    { id: 'story', label: '📖 Story', count: filterQuests('available').length },
    { id: 'challenges', label: '🎯 Challenges', count: filterQuests().length },
  ];

  return (
    <div className="quest-panel">
      {/* Header */}
      <div className="quest-header">
        <h2>📜 Quests</h2>
        <div className="quest-stats">
          <span>📊 {quests.filter((q) => q.status === 'completed').length}/{quests.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="quest-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`quest-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.label}
            {tab.count > 0 && <span className="badge">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Quest List */}
      <div className="quest-list">
        {/* In Progress */}
        {filterQuests('in_progress').length > 0 && (
          <div className="quest-section">
            <h3>🔄 In Progress</h3>
            {filterQuests('in_progress').map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClick={() => setSelectedQuest(quest)}
                onAction={
                  quest.status === 'completed'
                    ? () => setShowClaimModal(true)
                    : () => onAbandonQuest(quest.id)
                }
                actionLabel={quest.status === 'completed' ? '🎁 Claim' : '❌ Abandon'}
              />
            ))}
          </div>
        )}

        {/* Available */}
        <div className="quest-section">
          <h3>✨ Available</h3>
          {filterQuests('available').map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClick={() => setSelectedQuest(quest)}
              onAction={() => onAcceptQuest(quest.id)}
              actionLabel="▶️ Start"
            />
          ))}
          {filterQuests('available').length === 0 && (
            <div className="empty-state">No quests available</div>
          )}
        </div>

        {/* Completed */}
        <div className="quest-section">
          <h3>✅ Completed</h3>
          {filterQuests('completed').map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClick={() => setSelectedQuest(quest)}
              actionLabel="✓"
              disabled
            />
          ))}
        </div>
      </div>

      {/* Quest Detail Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <QuestDetailModal
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onAccept={() => {
              onAcceptQuest(selectedQuest.id);
              setSelectedQuest(null);
            }}
            onClaim={() => {
              onClaimReward(selectedQuest.id);
              setSelectedQuest(null);
            }}
            onNavigate={onNavigateToQuest}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Quest Card Component
const QuestCard: React.FC<{
  quest: Quest;
  onClick: () => void;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}> = ({ quest, onClick, onAction, actionLabel, disabled }) => {
  const progress = quest.requirements.reduce(
    (acc, req) => acc + (req.current / req.targetValue) * 100,
    0
  ) / quest.requirements.length;

  return (
    <motion.div
      className={`quest-card ${quest.status} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
    >
      <div className="quest-card-header">
        <div className="quest-icon">
          {quest.type === 'daily' && '📅'}
          {quest.type === 'weekly' && '📆'}
          {quest.type === 'story' && '📖'}
          {quest.type === 'challenge' && '🎯'}
          {quest.type === 'community' && '👥'}
        </div>
        <div className="quest-info">
          <h4>{quest.title}</h4>
          <div className="quest-meta">
            <span className={`difficulty-${quest.difficulty}`}>
              {'⭐'.repeat(quest.difficulty)}
            </span>
            {quest.timeLimit && <span>⏰ {formatTime(quest.timeLimit * 1000)}</span>}
          </div>
        </div>
        <div className="quest-status-badge">{quest.status.replace('_', ' ')}</div>
      </div>

      {quest.status === 'in_progress' && (
        <div className="quest-progress">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            {quest.requirements.map((r) => `${r.current}/${r.targetValue}`).join(', ')}
          </span>
        </div>
      )}

      <div className="quest-rewards">
        {quest.rewards.gold && <span>💰 {formatNumber(quest.rewards.gold)}</span>}
        {quest.rewards.xp && <span>✨ {quest.rewards.xp} XP</span>}
        {quest.rewards.nft && (
          <span className={`nft-reward ${quest.rewards.nft.rarity}`}>
            🏆 {quest.rewards.nft.name}
          </span>
        )}
      </div>

      {onAction && !disabled && (
        <button className="quest-action-btn" onClick={(e) => { e.stopPropagation(); onAction(); }}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

// Quest Detail Modal
const QuestDetailModal: React.FC<{
  quest: Quest;
  onClose: () => void;
  onAccept: () => void;
  onClaim: () => void;
  onNavigate?: (questId: string) => void;
}> = ({ quest, onClose, onAccept, onClaim, onNavigate }) => {
  return (
    <motion.div
      className="quest-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="quest-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="quest-modal-header">
          <h2>{quest.title}</h2>
          <div className="quest-type-badge">{quest.type}</div>
        </div>

        <div className="quest-modal-body">
          <p className="quest-description">{quest.description}</p>

          {/* Requirements */}
          <div className="quest-requirements">
            <h4>📋 Requirements</h4>
            {quest.requirements.map((req, index) => (
              <div key={index} className="requirement-item">
                <div className="requirement-info">
                  <span className="requirement-type">
                    {req.type === 'build' && '🏗️'}
                    {req.type === 'collect' && '💰'}
                    {req.type === 'reach' && '🎯'}
                    {req.type === 'trade' && '💱'}
                    {req.type === 'friend' && '👥'}
                    {req.type === 'time' && '⏰'}
                  </span>
                  <span className="requirement-text">
                    {req.target} {req.current > 0 && `(${req.current}/${req.targetValue})`}
                  </span>
                </div>
                {quest.status === 'in_progress' && (
                  <div className="requirement-progress">
                    <div className="mini-progress">
                      <motion.div
                        className="mini-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(req.current / req.targetValue) * 100}%` }}
                      />
                    </div>
                    <span>{Math.round((req.current / req.targetValue) * 100)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rewards */}
          <div className="quest-rewards-section">
            <h4>🎁 Rewards</h4>
            <div className="rewards-grid">
              {quest.rewards.gold && (
                <div className="reward-item gold">
                  <span className="reward-icon">💰</span>
                  <span className="reward-amount">{formatNumber(quest.rewards.gold)}</span>
                  <span className="reward-label">Gold</span>
                </div>
              )}
              {quest.rewards.xp && (
                <div className="reward-item xp">
                  <span className="reward-icon">✨</span>
                  <span className="reward-amount">{quest.rewards.xp}</span>
                  <span className="reward-label">XP</span>
                </div>
              )}
              {quest.rewards.tokens && (
                <div className="reward-item tokens">
                  <span className="reward-icon">🪙</span>
                  <span className="reward-amount">{quest.rewards.tokens}</span>
                  <span className="reward-label">Tokens</span>
                </div>
              )}
              {quest.rewards.nft && (
                <div className={`reward-item nft ${quest.rewards.nft.rarity}`}>
                  <span className="reward-icon">🏆</span>
                  <span className="reward-amount">{quest.rewards.nft.name}</span>
                  <span className="reward-label">{quest.rewards.nft.rarity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="quest-modal-footer">
          {quest.status === 'available' && (
            <button className="btn-primary" onClick={onAccept}>
              ▶️ Start Quest
            </button>
          )}
          {quest.status === 'in_progress' && (
            <button
              className="btn-secondary"
              onClick={onNavigate ? () => onNavigate(quest.id) : undefined}
            >
              🎯 Go to Quest
            </button>
          )}
          {quest.status === 'completed' && (
            <button className="btn-success" onClick={onClaim}>
              🎁 Claim Reward
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Daily Quest Resets
export const QuestResetTimer: React.FC<{
  nextDailyReset: Date;
  nextWeeklyReset: Date;
}> = ({ nextDailyReset, nextWeeklyReset }) => {
  const [timeLeft, setTimeLeft] = useState({ daily: 0, weekly: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft({
        daily: nextDailyReset.getTime() - Date.now(),
        weekly: nextWeeklyReset.getTime() - Date.now(),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextDailyReset, nextWeeklyReset]);

  return (
    <div className="quest-reset-timer">
      <div className="reset-item">
        <span>📅 Daily Reset:</span>
        <span>{formatTime(timeLeft.daily)}</span>
      </div>
      <div className="reset-item">
        <span>📆 Weekly Reset:</span>
        <span>{formatTime(timeLeft.weekly)}</span>
      </div>
    </div>
  );
};

export default QuestPanel;
