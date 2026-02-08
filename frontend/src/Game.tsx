/**
 * Solana AI City - Main Game Component
 * 
 * Main game page that combines all components
 * Optimized with Vercel React Best Practices
 */

import React, { Suspense, lazy, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Lazy Load Components (Code Splitting)
// ============================================================================

// Use lazy loading for better performance
const ResourcePanel = lazy(() => import('./components/ResourcePanel'));
const BuildingMenu = lazy(() => import('./components/BuildingMenu'));
const AISuggestionPanel = lazy(() => import('./components/AISuggestionPanel'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));

// ============================================================================
// Skeleton Loaders
// ============================================================================

const ResourcePanelSkeleton = () => (
  <div className="animate-pulse bg-slate-800 rounded-xl p-4">
    <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
    <div className="grid grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 bg-slate-700 rounded" />
      ))}
    </div>
  </div>
);

const ComponentSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`animate-pulse bg-slate-800 rounded-xl ${height}`} />
);

// ============================================================================
// Game Component
// ============================================================================

export default function Game() {
  // Game state
  const [resources, setResources] = useState({
    gold: 1000,
    wood: 500,
    stone: 250,
    food: 1000,
    energy: 500,
  });
  
  const [resourceChanges, setResourceChanges] = useState({
    gold: 10,
    wood: 5,
    stone: 2,
    food: 15,
    energy: 20,
  });
  
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('daily');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  
  // Mock AI suggestions
  const aiSuggestions = useMemo(() => [
    {
      id: 'suggestion-1',
      priority: 'high' as const,
      action: 'Build more houses',
      reason: 'You need more population to grow',
      expectedGain: '+25 population',
      timestamp: Date.now(),
    },
    {
      id: 'suggestion-2',
      priority: 'medium' as const,
      action: 'Upgrade gold mine',
      reason: 'Gold production is low',
      expectedGain: '+15 gold/sec',
      timestamp: Date.now(),
    },
  ], []);
  
  // Mock leaderboard entries
  const leaderboardEntries = useMemo(() => [
    { rank: 1, playerId: 'p1', playerName: 'CryptoKing', cityName: 'Metropolis', score: 15420, level: 25, population: 5000, buildings: 150, lastActive: new Date() },
    { rank: 2, playerId: 'p2', playerName: 'SolanaBuilder', cityName: 'Sunrise City', score: 12350, level: 22, population: 4200, buildings: 120, lastActive: new Date() },
    { rank: 3, playerId: 'p3', playerName: 'DeFiMaster', cityName: 'Fortune Town', score: 11200, level: 20, population: 3800, buildings: 100, lastActive: new Date() },
    { rank: 4, playerId: 'p4', playerName: 'Web3Ninja', cityName: 'Shadow Valley', score: 9800, level: 18, population: 3200, buildings: 85, lastActive: new Date() },
    { rank: 5, playerId: 'p5', playerName: 'GamerPro', cityName: 'Victory Hills', score: 8500, level: 16, population: 2800, buildings: 75, lastActive: new Date() },
  ], []);
  
  // Handle building selection
  const handleBuildingSelect = useCallback((building: any) => {
    setSelectedBuilding(building.id);
  }, []);
  
  // Handle resource update
  const handleResourceUpdate = useCallback((newResources: typeof resources) => {
    setResources(newResources);
  }, []);
  
  return (
    <div className="game-container">
      {/* Header */}
      <header className="game-header">
        <div className="header-left">
          <h1 className="game-title">
            <span className="title-icon" aria-hidden="true">🏙️</span>
            Solana AI City
          </h1>
          <p className="game-subtitle">
            Build your AI-powered city
          </p>
        </div>
        
        <div className="header-actions">
          {/* Toggle Leaderboard */}
          <motion.button
            className={`btn-icon ${showLeaderboard ? 'active' : ''}`}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle leaderboard"
            aria-pressed={showLeaderboard}
          >
            🏆
          </motion.button>
          
          {/* Toggle AI Suggestions */}
          <motion.button
            className={`btn-icon ${showAISuggestions ? 'active' : ''}`}
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle AI suggestions"
            aria-pressed={showAISuggestions}
          >
            🤖
          </motion.button>
          
          {/* Settings */}
          <motion.button
            className="btn-icon"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Settings"
          >
            ⚙️
          </motion.button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="game-main">
        {/* Left Sidebar - Resources */}
        <aside className="sidebar-left">
          <Suspense fallback={<ResourcePanelSkeleton />}>
            <ResourcePanel
              resources={resources}
              changes={resourceChanges}
            />
          </Suspense>
        </aside>
        
        {/* Center - Game Map Area */}
        <section className="game-area" aria-label="Game map">
          <Suspense fallback={<ComponentSkeleton height="h-full" />}>
            {showLeaderboard ? (
              <Leaderboard
                entries={leaderboardEntries}
                currentPlayerId="current-user"
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            ) : (
              <GameMap
                selectedBuilding={selectedBuilding}
                onBuildingSelect={handleBuildingSelect}
                resources={resources}
              />
            )}
          </Suspense>
        </section>
        
        {/* Right Sidebar - Buildings & AI */}
        <aside className="sidebar-right">
          {/* Building Menu */}
          <BuildingMenu
            selectedBuilding={selectedBuilding}
            onSelectBuilding={handleBuildingSelect}
            resources={resources}
          />
          
          {/* AI Suggestions */}
          <AnimatePresence>
            {showAISuggestions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AISuggestionPanel
                  suggestions={aiSuggestions}
                  currentStrategy="balanced"
                  onApplySuggestion={(suggestion) => console.log('Apply:', suggestion)}
                  onDismissSuggestion={(id) => console.log('Dismiss:', id)}
                  onStrategyChange={(strategy) => console.log('Strategy:', strategy)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>
      
      {/* Footer */}
      <footer className="game-footer">
        <p className="footer-info">
          🎮 Powered by Solana AI • Built with React + Vercel
        </p>
        <div className="footer-links">
          <a href="#" className="footer-link">Help</a>
          <a href="#" className="footer-link">Feedback</a>
          <a href="#" className="footer-link">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Game Map Component (Placeholder)
// ============================================================================

function GameMap({ 
  selectedBuilding,
  onBuildingSelect,
  resources 
}: { 
  selectedBuilding: string | null;
  onBuildingSelect: (building: any) => void;
  resources: typeof resources;
}) {
  return (
    <div className="game-map">
      <div className="map-placeholder">
        <span className="map-icon" aria-hidden="true">🗺️</span>
        <h2 className="map-title">Game Map</h2>
        <p className="map-subtitle">
          {selectedBuilding 
            ? `Click on the map to place your ${selectedBuilding}`
            : 'Select a building from the menu to start building!'}
        </p>
        
        {/* Placeholder Grid */}
        <div className="placeholder-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="placeholder-cell">
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default Game;
