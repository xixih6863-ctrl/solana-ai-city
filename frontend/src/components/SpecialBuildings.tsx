import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInterval } from '../hooks';

// ============================================
// Special Buildings & Facilities
// ============================================

export interface SpecialBuilding {
  id: string;
  type: SpecialBuildingType;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  requirements: {
    gold: number;
    level: number;
    prerequisites?: string[];
    buildings?: { type: string; level: number }[];
  };
  effects: SpecialEffect[];
  upgradeCost: {
    gold: number;
    time: number; // seconds
    materials?: { type: string; quantity: number }[];
  };
  isUnlocked: boolean;
}

export type SpecialBuildingType =
  | 'hospital'      // 医院 - 治疗市民
  | 'university'    // 大学 - 研究点数
  | 'stadium'       // 体育场 - 娱乐活动
  | 'space_port'    // 太空站 - 特殊任务
  | 'research_lab'  // 实验室 - 研发科技
  | 'power_plant'   // 发电厂 - 提供能源
  | 'water_plant'   // 水处理 - 水资源
  | 'mining_station'// 采矿站 - 资源开采
  | 'temple'        // 神殿 - 特殊加成
  | 'broadcast'     // 广播塔 - 宣传加成
  | 'police'        // 警察局 - 安全加成
  | 'fire'          // 消防局 - 灾害防护
  | 'bank'          // 银行 - 利息加成
  | 'museum'        // 博物馆 - 文化加成
  | 'park'          // 公园 - 幸福度加成;

export interface SpecialEffect {
  type: 'heal' | 'research' | 'entertainment' | 'energy' | 'water' | 'resource' | 'bonus' | 'protection';
  value: number;
  target?: string;
  conditions?: string[];
}

interface SpecialBuildingsPanelProps {
  buildings: SpecialBuilding[];
  onUpgrade: (buildingId: string) => Promise<void>;
  onUnlock: (buildingType: SpecialBuildingType) => Promise<void>;
  onCollect: (buildingId: string) => void;
  gameState: {
    gold: number;
    population: number;
    happiness: number;
    research: number;
    energy: number;
    water: number;
  };
}

export const SpecialBuildingsPanel: React.FC<SpecialBuildingsPanelProps> = ({
  buildings,
  onUpgrade,
  onUnlock,
  onCollect,
  gameState,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'utility' | 'culture' | 'special'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<SpecialBuilding | null>(null);

  const categories = [
    { id: 'all', label: '🏛️ All', count: buildings.length },
    { id: 'utility', label: '⚡ Utility', count: buildings.filter((b) => ['hospital', 'power_plant', 'water_plant', 'mining_station'].includes(b.type)).length },
    { id: 'culture', label: '🎭 Culture', count: buildings.filter((b) => ['stadium', 'museum', 'park', 'temple'].includes(b.type)).length },
    { id: 'special', label: '🚀 Special', count: buildings.filter((b) => ['space_port', 'research_lab', 'broadcast'].includes(b.type)).length },
  ];

  const filteredBuildings = buildings.filter((b) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'utility') return ['hospital', 'power_plant', 'water_plant', 'mining_station', 'bank', 'police', 'fire'].includes(b.type);
    if (selectedCategory === 'culture') return ['stadium', 'museum', 'park', 'temple'].includes(b.type);
    if (selectedCategory === 'special') return ['space_port', 'research_lab', 'broadcast'].includes(b.type);
    return true;
  });

  return (
    <div className="special-buildings-panel">
      {/* Header */}
      <div className="special-buildings-header">
        <h2>🏛️ Special Buildings</h2>
        <div className="resources-summary">
          <span>📚 Research: {gameState.research}</span>
          <span>⚡ Energy: {gameState.energy}</span>
          <span>💧 Water: {gameState.water}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="special-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`special-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Buildings Grid */}
      <div className="special-buildings-grid">
        {filteredBuildings.map((building) => (
          <SpecialBuildingCard
            key={building.id}
            building={building}
            canAfford={gameState.gold >= building.upgradeCost.gold}
            onClick={() => setSelectedBuilding(building)}
            onUpgrade={() => onUpgrade(building.id)}
          />
        ))}
      </div>

      {/* Building Detail Modal */}
      <AnimatePresence>
        {selectedBuilding && (
          <SpecialBuildingModal
            building={selectedBuilding}
            gameState={gameState}
            onClose={() => setSelectedBuilding(null)}
            onUpgrade={() => onUpgrade(selectedBuilding.id)}
            onCollect={() => {
              onCollect(selectedBuilding.id);
              setSelectedBuilding(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Special Building Card
const SpecialBuildingCard: React.FC<{
  building: SpecialBuilding;
  canAfford: boolean;
  onClick: () => void;
  onUpgrade: () => void;
}> = ({ building, canAfford, onClick, onUpgrade }) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: 1.02,
        transition: { duration: 0.2 },
      });
    } else {
      controls.start({
        scale: 1,
        transition: { duration: 0.2 },
      });
    }
  }, [isHovered, controls]);

  return (
    <motion.div
      className={`special-building-card ${!building.isUnlocked ? 'locked' : ''} ${!canAfford && building.isUnlocked ? 'expensive' : ''}`}
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -5 }}
    >
      {!building.isUnlocked && <div className="locked-overlay">🔒</div>}
      
      <div className="building-icon">{building.icon}</div>
      
      <div className="building-info">
        <h4>{building.name}</h4>
        <div className="building-level">Lv. {building.level}/{building.maxLevel}</div>
      </div>

      {/* Effects Preview */}
      <div className="building-effects">
        {building.effects.slice(0, 2).map((effect, index) => (
          <span key={index} className={`effect-badge ${effect.type}`}>
            {getEffectIcon(effect.type)}{effect.value}
          </span>
        ))}
      </div>

      {/* Upgrade Button */}
      {building.isUnlocked && building.level < building.maxLevel && (
        <div className="upgrade-indicator">
          <span className="upgrade-cost">💰 {building.upgradeCost.gold.toLocaleString()}</span>
          <div className="mini-progress">
            <motion.div
              className="mini-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(building.level / building.maxLevel) * 100}%` }}
            />
          </div>
        </div>
      )}

      {building.level === building.maxLevel && (
        <div className="max-level-badge">MAX</div>
      )}
    </motion.div>
  );
};

const getEffectIcon = (type: SpecialEffect['type']) => {
  switch (type) {
    case 'heal': return '💊';
    case 'research': return '📚';
    case 'entertainment': return '🎭';
    case 'energy': return '⚡';
    case 'water': return '💧';
    case 'resource': return '💰';
    case 'bonus': return '✨';
    case 'protection': return '🛡️';
    default: return '⭐';
  }
};

// Special Building Modal
const SpecialBuildingModal: React.FC<{
  building: SpecialBuilding;
  gameState: any;
  onClose: () => void;
  onUpgrade: () => void;
  onCollect: () => void;
}> = ({ building, gameState, onClose, onUpgrade, onCollect }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState(0);

  const canUpgrade = gameState.gold >= building.upgradeCost.gold &&
    gameState.population >= building.requirements.level * 100;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Simulate upgrade progress
    const duration = building.upgradeCost.time * 1000;
    const steps = 100;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, stepTime));
      setUpgradeProgress(i);
    }
    
    await onUpgrade();
    setIsUpgrading(false);
    setUpgradeProgress(0);
  };

  return (
    <motion.div
      className="special-building-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="special-building-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <div className="modal-icon">{building.icon}</div>
          <div>
            <h2>{building.name}</h2>
            <div className="modal-level">Level {building.level}/{building.maxLevel}</div>
          </div>
        </div>

        <p className="modal-description">{building.description}</p>

        {/* Effects */}
        <div className="modal-effects">
          <h4>✨ Effects</h4>
          <div className="effects-list">
            {building.effects.map((effect, index) => (
              <div key={index} className={`effect-item ${effect.type}`}>
                <span className="effect-icon">{getEffectIcon(effect.type)}</span>
                <div className="effect-info">
                  <span className="effect-type">{effect.type}</span>
                  <span className="effect-value">+{effect.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Progress */}
        {isUpgrading && (
          <div className="upgrade-progress">
            <div className="progress-label">Upgrading...</div>
            <div className="progress-bar large">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${upgradeProgress}%` }}
              />
            </div>
            <div className="progress-time">
              ⏰ {Math.ceil((1 - upgradeProgress / 100) * building.upgradeCost.time)}s remaining
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        {!isUpgrading && building.level < building.maxLevel && (
          <div className="modal-upgrade">
            <div className="upgrade-info">
              <h4>⬆️ Upgrade to Level {building.level + 1}</h4>
              <div className="upgrade-requirements">
                <div className="requirement">
                  <span>💰 Gold:</span>
                  <span className={gameState.gold >= building.upgradeCost.gold ? 'sufficient' : 'insufficient'}>
                    {building.upgradeCost.gold.toLocaleString()}
                  </span>
                </div>
                <div className="requirement">
                  <span>👥 Population:</span>
                  <span className={gameState.population >= building.requirements.level * 100 ? 'sufficient' : 'insufficient'}>
                    {building.requirements.level * 100}
                  </span>
                </div>
                <div className="requirement">
                  <span>⏱️ Time:</span>
                  <span>{building.upgradeCost.time}s</span>
                </div>
              </div>
            </div>
            
            <button
              className={`upgrade-btn ${!canUpgrade ? 'disabled' : ''}`}
              onClick={handleUpgrade}
              disabled={!canUpgrade}
            >
              {!canUpgrade ? '❌ Requirements Not Met' : '🚀 Start Upgrade'}
            </button>
          </div>
        )}

        {/* Max Level */}
        {building.level === building.maxLevel && (
          <div className="max-level-info">
            <div className="max-badge">🏆 MAX LEVEL</div>
            <p>This building is at maximum level!</p>
          </div>
        )}

        {/* Collect Resources (for passive income buildings) */}
        {building.effects.some((e) => e.type === 'resource') && (
          <button className="collect-btn" onClick={onCollect}>
            💰 Collect Resources
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// Power Plant Component (Example of a special building)
export const PowerPlant: React.FC<{
  level: number;
  energyOutput: number;
  onUpgrade: () => void;
  upgradeCost: { gold: number; time: number };
}> = ({ level, energyOutput, onUpgrade, upgradeCost }) => {
  return (
    <motion.div
      className="power-plant-building"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="plant-visual">
        <motion.div
          className="energy-core"
          animate={{
            boxShadow: [
              '0 0 20px #22D3EE',
              '0 0 40px #22D3EE',
              '0 0 20px #22D3EE',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="plant-stats">
        <h4>⚡ Power Plant Lv.{level}</h4>
        <div className="stat-row">
          <span>Output:</span>
          <span>+{energyOutput}/s</span>
        </div>
        <button className="upgrade-btn" onClick={onUpgrade}>
          Upgrade ({upgradeCost.gold}g, {upgradeCost.time}s)
        </button>
      </div>
    </motion.div>
  );
};

// Research Lab Component
export const ResearchLab: React.FC<{
  level: number;
  researchPoints: number;
  currentResearch?: string;
  progress?: number;
}> = ({ level, researchPoints, currentResearch, progress = 0 }) => {
  const [isResearching, setIsResearching] = useState(!!currentResearch);

  return (
    <motion.div
      className="research-lab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="lab-header">
        <span className="lab-icon">🔬</span>
        <span>Research Lab Lv.{level}</span>
      </div>
      
      <div className="lab-stats">
        <div className="stat">
          <span className="stat-label">Total Research</span>
          <span className="stat-value">📚 {researchPoints}</span>
        </div>
      </div>

      {isResearching && (
        <div className="research-progress">
          <div className="research-name">{currentResearch}</div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      <div className="research-queue">
        <h5>🔬 Available Research</h5>
        <ul>
          <li>🔋 Battery Tech (Lv.{level + 1})</li>
          <li>🏗️ Advanced Materials (Lv.{level + 2})</li>
          <li>🤖 AI Systems (Lv.{level + 3})</li>
        </ul>
      </div>
    </motion.div>
  );
};

// Space Port Component
export const SpacePort: React.FC<{
  level: number;
  missions: Mission[];
  onStartMission: (missionId: string) => void;
}> = ({ level, missions, onStartMission }) => {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  return (
    <motion.div
      className="space-port"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="space-port-header">
        <span className="port-icon">🚀</span>
        <span>Space Port Lv.{level}</span>
      </div>

      <div className="missions-grid">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            className={`mission-card ${selectedMission === mission.id ? 'selected' : ''}`}
            onClick={() => setSelectedMission(mission.id)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="mission-header">
              <span className="mission-icon">{mission.icon}</span>
              <span className="mission-name">{mission.name}</span>
            </div>
            <p className="mission-description">{mission.description}</p>
            <div className="mission-rewards">
              <span>💰 {mission.rewardGold}</span>
              <span>📚 {mission.rewardResearch}</span>
              <span>🪙 {mission.rewardTokens}</span>
            </div>
            <div className="mission-duration">
              ⏱️ {mission.duration}s
            </div>
            <button
              className="start-mission-btn"
              onClick={(e) => {
                e.stopPropagation();
                onStartMission(mission.id);
              }}
            >
              🚀 Launch
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Mission Interface
export interface Mission {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: number;
  requirements: {
    energy?: number;
    research?: number;
    population?: number;
  };
  rewards: {
    gold: number;
    research: number;
    tokens: number;
    items?: string[];
  };
  successRate: number;
}

export default {
  SpecialBuildingsPanel,
  PowerPlant,
  ResearchLab,
  SpacePort,
};
