import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// ============================================
// Complete Game Demo - All Features Together
// ============================================

import {
  ResourcePanel,
  BuildingMenu,
  GameMap,
  PlayerProfile,
  Leaderboard,
  ShopPanel,
  QuestPanel,
  ChatRoom,
  WalletConnect,
  AchievementNFT,
} from './components';

// Demo Data
const DEMO_PLAYER = {
  id: '1',
  username: 'CryptoKing',
  avatar: '👑',
  level: 15,
  experience: 12500,
  points: 45230,
  rank: 247,
  gold: 12500,
  energy: 85,
  population: 1250,
  achievements: ['first_build', 'golden_city', 'social_butterfly'],
};

const DEMO_BUILDINGS = [
  { id: '1', type: 'house', position: { x: 2, y: 2 }, level: 3, builtAt: Date.now() - 86400000 },
  { id: '2', type: 'factory', position: { x: 4, y: 3 }, level: 2, builtAt: Date.now() - 43200000 },
  { id: '3', type: 'shop', position: { x: 3, y: 5 }, level: 4, builtAt: Date.now() - 172800000 },
];

const DEMO_QUESTS = [
  {
    id: 'q1',
    title: 'Build Your First House',
    description: 'Construct your first residential building',
    type: 'daily' as const,
    status: 'completed' as const,
    difficulty: 1,
    rewards: { gold: 100, xp: 50 },
    requirements: [{ type: 'build' as const, target: 'House', current: 5, targetValue: 1 }],
    timeLimit: 3600,
  },
  {
    id: 'q2',
    title: 'City Expansion',
    description: 'Build 10 more buildings',
    type: 'weekly' as const,
    status: 'in_progress' as const,
    difficulty: 3,
    rewards: { gold: 1000, xp: 500, tokens: 10 },
    requirements: [{ type: 'build' as const, target: 'Buildings', current: 8, targetValue: 10 }],
    timeLimit: 604800,
  },
];

const DEMO_MESSAGES = [
  { id: '1', sender: 'System', content: 'Welcome to Solana AI City!', timestamp: Date.now(), type: 'system' as const },
  { id: '2', sender: 'CryptoKing', content: 'Hey everyone!', timestamp: Date.now(), type: 'text' as const, isOwn: true },
];

const DEMO_SHOP_ITEMS = [
  {
    id: '1',
    name: 'Golden Palace',
    description: 'A magnificent palace that boosts gold production by 50%',
    type: 'building' as const,
    price: { type: 'sol' as const, amount: 2.5 },
    icon: '🏛️',
    rarity: 'legendary' as const,
    featured: true,
  },
  {
    id: '2',
    name: 'Premium Avatar',
    description: 'Exclusive robot avatar',
    type: 'avatar' as const,
    price: { type: 'premium' as const, amount: 5 },
    icon: '🤖',
    rarity: 'epic' as const,
  },
];

// Main Game Component
export const SolanaAIGame: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'map' | 'quests' | 'shop' | 'chat' | 'achievements'>('map');
  const [resources, setResources] = useState({
    gold: DEMO_PLAYER.gold,
    energy: DEMO_PLAYER.energy,
    points: DEMO_PLAYER.points,
    population: DEMO_PLAYER.population,
  });
  const [buildings, setBuildings] = useState(DEMO_BUILDINGS);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Resource update simulation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setResources((prev) => ({
        ...prev,
        gold: prev.gold + 1,
        energy: Math.min(100, prev.energy + 0.5),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBuild = useCallback((type: string, position: { x: number; y: number }) => {
    const newBuilding = {
      id: Date.now().toString(),
      type,
      position,
      level: 1,
      builtAt: Date.now(),
    };
    setBuildings((prev) => [...prev, newBuilding]);
    setResources((prev) => ({
      ...prev,
      gold: prev.gold - 100,
    }));
  }, []);

  const handleConnectWallet = useCallback(() => {
    setIsWalletConnected(true);
  }, []);

  return (
    <div className="solana-ai-game">
      {/* Top Header */}
      <header className="game-header">
        <div className="logo">🏙️ Solana AI City</div>
        <ResourcePanel
          resources={resources}
          onResourceUpdate={setResources}
        />
        <WalletConnect
          onConnect={handleConnectWallet}
          connected={isWalletConnected}
        />
      </header>

      {/* Main Content */}
      <main className="game-main">
        {/* Left Sidebar - Building Menu */}
        <aside className="game-sidebar left">
          <BuildingMenu
            buildings={buildings}
            onBuild={handleBuild}
            selectedBuilding={selectedBuilding}
          />
        </aside>

        {/* Center - Game Map */}
        <section className="game-map-container">
          <GameMap
            buildings={buildings}
            gridSize={10}
            selectedBuilding={selectedBuilding}
            onTileClick={(pos) => {
              if (selectedBuilding) {
                handleBuild(selectedBuilding, pos);
                setSelectedBuilding(null);
              }
            }}
            onBuildingClick={(id) => setSelectedBuilding(id)}
          />
        </section>

        {/* Right Sidebar */}
        <aside className="game-sidebar right">
          <PlayerProfile player={DEMO_PLAYER} />
          <Leaderboard
            entries={[
              { rank: 1, username: 'CryptoKing', points: 45230, city: 'Neo Tokyo', level: 15 },
              { rank: 2, username: 'SolanaGirl', points: 38900, city: 'Crypto City', level: 12 },
              { rank: 3, username: 'Web3Builder', points: 32450, city: 'Digital Heights', level: 10 },
            ]}
            currentUser={DEMO_PLAYER}
          />
        </aside>
      </main>

      {/* Bottom Navigation */}
      <nav className="game-nav">
        {[
          { id: 'map', icon: '🗺️', label: 'Map' },
          { id: 'quests', icon: '📜', label: 'Quests' },
          { id: 'shop', icon: '🛒', label: 'Shop' },
          { id: 'chat', icon: '💬', label: 'Chat' },
          { id: 'achievements', icon: '🏆', label: 'Achievements' },
        ].map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => setActivePanel(item.id as typeof activePanel)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Panel Overlays */}
      {activePanel === 'quests' && (
        <QuestPanel
          quests={DEMO_QUESTS as any}
          activeQuest={DEMO_QUESTS[1] as any}
          onAcceptQuest={(id) => console.log('Accept:', id)}
          onCompleteQuest={(id) => console.log('Complete:', id)}
          onClaimReward={(id) => console.log('Claim:', id)}
          onAbandonQuest={(id) => console.log('Abandon:', id)}
          onViewQuest={(id) => console.log('View:', id)}
        />
      )}

      {activePanel === 'shop' && (
        <ShopPanel
          categories={[
            { id: 'buildings', name: 'Buildings', icon: '🏗️', items: DEMO_SHOP_ITEMS },
          ]}
          userBalance={{
            sol: 12.5,
            usdc: 500,
            gold: resources.gold,
            premium: 25,
          }}
          onPurchase={(id, qty) => console.log('Purchase:', id, qty)}
          onSelectItem={(item) => console.log('Select:', item)}
          onClose={() => setActivePanel('map')}
        />
      )}

      {activePanel === 'chat' && (
        <ChatRoom
          messages={DEMO_MESSAGES as any}
          onSendMessage={(msg) => console.log('Send:', msg)}
          currentUser={DEMO_PLAYER.username}
          onlineUsers={['CryptoKing', 'SolanaGirl', 'Web3Builder', 'AIArchitect']}
        />
      )}

      {/* Achievement Popup */}
      <motion.div
        className="achievement-popup"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' }}
      >
        🏆 Achievement Unlocked!
      </motion.div>
    </div>
  );
};

// Export for testing
export default SolanaAIGame;
