# API Reference

## Table of Contents
- [Core Hooks](#core-hooks)
- [Components](#components)
- [Services](#services)
- [Stores](#stores)
- [Utils](#utils)
- [Types](#types)

---

## Core Hooks

### `useGameLoop`
```typescript
import { useGameLoop } from './hooks/useGameLoop';

const {
  isRunning,
  elapsed,
  tick,
  start,
  stop,
  reset,
} = useGameLoop({
  tickRate: 1000, // ms between ticks
  onTick: (gameState) => {
    // Update resources
    // Check win/lose conditions
  },
});

// Start the game loop
start();

// Check elapsed time
console.log(elapsed); // ms since start

// Stop the loop
stop();
```

### `useWallet`
```typescript
import { useWallet } from './hooks/useWallet';

const {
  wallet,
  connected,
  connecting,
  disconnect,
  connect,
  signTransaction,
  signAllTransactions,
} = useWallet();

// Check connection status
if (connected) {
  console.log('Connected to:', wallet?.adapter?.name);
  console.log('Public Key:', wallet?.publicKey?.toString());
}

// Sign a transaction
const signedTx = await signTransaction(transaction);
```

### `useConnection`
```typescript
import { useConnection } from './hooks/useConnection';

const {
  connection,
  network,
  getBalance,
  getAccountInfo,
  getParsedTokenAccountsByOwner,
  requestAirdrop,
} = useConnection();

// Get SOL balance
const balance = await getBalance(publicKey);

// Get token accounts
const tokenAccounts = await getParsedTokenAccountsByOwner(
  publicKey,
  { programId: TOKEN_PROGRAM_ID }
);
```

---

## Components

### `<WalletConnect />`
```typescript
import { WalletConnect } from './components/WalletConnect';

// Basic usage
<WalletConnect 
  onConnect={(wallet) => console.log('Connected:', wallet)}
  onDisconnect={() => console.log('Disconnected')}
/>

// With custom networks
<WalletConnect
  networks={['mainnet-beta', 'devnet']}
  preferredWallet="phantom"
/>

// Props
interface WalletConnectProps {
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  networks?: Network[];
  preferredWallet?: WalletName;
  theme?: 'light' | 'dark';
}
```

### `<ResourcePanel />`
```typescript
import { ResourcePanel } from './components/ResourcePanel';

<ResourcePanel
  resources={{
    gold: 1250,
    energy: 85,
    points: 4520,
    population: 1250,
  }}
  rates={{
    goldPerSecond: 10,
    energyPerSecond: -1,
  }}
  onResourceUpdate={(resources) => {
    console.log('Updated:', resources);
  }}
/>

// Props
interface ResourcePanelProps {
  resources: GameResources;
  rates?: ResourceRates;
  onResourceUpdate?: (resources: GameResources) => void;
  showRates?: boolean;
  animated?: boolean;
}
```

### `<BuildingMenu />`
```typescript
import { BuildingMenu } from './components/BuildingMenu';

<BuildingMenu
  availableBuildings={BUILDING_TYPES}
  selectedCategory="residential"
  onSelectBuilding={(building) => {
    console.log('Selected:', building);
    setPlacingBuilding(building);
  }}
  onBuild={(building, position) => {
    console.log('Built:', building, 'at', position);
  }}
  filters={['residential', 'commercial', 'industrial']}
/>
```

### `<GameMap />`
```typescript
import { GameMap } from './components/GameMap';

<GameMap
  gridSize={10}
  tileSize={64}
  buildings={playerBuildings}
  selectedBuilding={placingBuilding}
  onTileClick={(x, y) => {
    console.log('Tile clicked:', x, y);
    placeBuilding(x, y);
  }}
  onBuildingClick={(building) => {
    console.log('Building clicked:', building);
  }}
  validTiles={validPlacementTiles}
  showGrid={true}
  animated={true}
/>
```

### `<AISuggestionPanel />`
```typescript
import { AISuggestionPanel } from './components/AISuggestionPanel';

<AISuggestionPanel
  gameState={gameState}
  playerResources={resources}
  marketData={marketTrends}
  onSuggestionClick={(suggestion) => {
    console.log('Applying suggestion:', suggestion);
    applySuggestion(suggestion);
  }}
  showROI={true}
  compact={false}
/>
```

### `<AchievementPanel />`
```typescript
import { AchievementPanel } from './components/AchievementPanel';

<AchievementPanel
  achievements={achievements}
  onViewNFT={(achievement) => {
    console.log('View NFT:', achievement);
    showNFTModal(achievement);
  }}
  rarityFilters={['common', 'rare', 'epic', 'legendary']}
  sortBy="recent"
/>
```

### `<Leaderboard />`
```typescript
import { Leaderboard } from './components/Leaderboard';

<Leaderboard
  entries={leaderboardData}
  currentRank={10}
  currentUser={user}
  timeFilter="weekly"
  onViewProfile={(userId) => {
    console.log('View profile:', userId);
  }}
  onChallenge={(userId) => {
    console.log('Challenge user:', userId);
  }}
  showFriends={true}
/>
```

### `<BlockchainPanel />`
```typescript
import { BlockchainPanel } from './components/BlockchainPanel';

<BlockchainPanel
  walletAddress={wallet.publicKey}
  tokens={tokenAccounts}
  nfts={nftCollection}
  transactions={recentTransactions}
  explorer="solscan"
  onViewOnExplorer={(txId) => {
    window.open(`https://solscan.io/tx/${txId}`);
  }}
  showPortfolio={true}
/>
```

---

## Services

### `walletService`
```typescript
import { walletService } from './services/wallet';

// Connect to a wallet
const wallet = await walletService.connect('phantom');

// Get connection state
const state = walletService.getState();

// Subscribe to changes
walletService.subscribe((state) => {
  console.log('Wallet state changed:', state);
});

// Disconnect
walletService.disconnect();
```

### `gameEngine`
```typescript
import { gameEngine } from './services/gameEngine';

// Initialize game
await gameEngine.initialize({
  gridSize: 10,
  startingResources: {
    gold: 1000,
    energy: 100,
    population: 0,
  },
});

// Start game loop
gameEngine.start();

// Build a building
const building = await gameEngine.build({
  type: 'house',
  position: { x: 5, y: 5 },
});

// Collect resources
gameEngine.on('resourceUpdate', (resources) => {
  console.log('Resources updated:', resources);
});

// Get game state
const state = gameEngine.getState();

// Save game
await gameEngine.save();

// Load game
await gameEngine.load(gameId);
```

### `achievementService`
```typescript
import { achievementService } from './services/achievement';

// Check and unlock achievements
const unlocked = await achievementService.checkAndUnlock(
  'built_10_buildings',
  { buildingCount: 12 }
);

// Mint achievement as NFT
const mintTx = await achievementService.mintAchievement(
  achievementId,
  recipientAddress,
  metadata
);

// Get player achievements
const achievements = await achievementService.getPlayerAchievements(
  playerAddress
);

// Verify NFT ownership
const isVerified = await achievementService.verifyOwnership(
  achievementId,
  playerAddress
);
```

### `aiAdvisor`
```typescript
import { aiAdvisor } from './services/aiAdvisor';

// Get building recommendations
const recommendations = await aiAdvisor.getRecommendations({
  resources: currentResources,
  grid: currentGrid,
  goals: ['maximize_gold', 'grow_population'],
});

// Calculate ROI
const roi = aiAdvisor.calculateROI({
  building: 'power_plant',
  currentResources,
  marketData,
});

// Get market analysis
const analysis = await aiAdvisor.getMarketAnalysis();

// Get strategy tips
const tips = aiAdvisor.getStrategyTips({
  playerLevel: 5,
  achievements: [],
  playStyle: 'balanced',
});
```

---

## Stores

### `gameStore`
```typescript
import { gameStore } from './stores/gameStore';

// Get state
const { resources, buildings, player, settings } = gameStore.getState();

// Subscribe to changes
gameStore.subscribe((state) => {
  console.log('Game state changed:', state);
});

// Update resources
gameStore.setResources({ gold: 1500 });

// Add building
gameStore.addBuilding(building);

// Update player stats
gameStore.updatePlayer({ points: 500 });

// Reset game
gameStore.reset();
```

### `walletStore`
```typescript
import { walletStore } from './stores/walletStore';

// Get state
const { connected, wallet, balance, tokens } = walletStore.getState();

// Subscribe
walletStore.subscribe((state) => {
  console.log('Wallet state:', state);
});

// Connect
walletStore.connect('phantom');

// Disconnect
walletStore.disconnect();

// Set preferred wallet
walletStore.setPreferredWallet('solflare');
```

---

## Utils

### `formatUtils`
```typescript
import { formatUtils } from './utils/format';

// Format SOL amount
formatUtils.formatSOL(1.5); // "1.5 SOL"
formatUtils.formatSOL(0.005, 4); // "0.0050 SOL"

// Format currency
formatUtils.formatUSD(1250.50); // "$1,250.50"

// Format large numbers
formatUtils.formatNumber(1000000); // "1,000,000"
formatUtils.formatCompact(1500000); // "1.5M"

// Format time
formatUtils.formatTime(3661000); // "1h 1m 1s"

// Format percentage
formatUtils.formatPercent(0.1234); // "12.34%"
formatUtils.formatPercent(0.05, 0); // "5%"
```

### `validationUtils`
```typescript
import { validationUtils } from './utils/validation';

// Validate wallet address
validationUtils.isValidAddress('7nY...'); // true/false

// Validate amount
validationUtils.isValidAmount(100); // true
validationUtils.isValidAmount(-10); // false

// Validate building placement
validationUtils.canPlaceBuilding({
  type: 'house',
  grid,
  position: { x: 5, y: 5 },
  resources,
}); // { valid: true, reason?: string }
```

### `networkUtils`
```typescript
import { networkUtils } from './utils/network';

// Get current network
const network = networkUtils.getCurrentNetwork();

// Switch network
await networkUtils.switchNetwork('mainnet-beta');

// Check network status
const status = networkUtils.getNetworkStatus('devnet');

// Get RPC endpoint
const rpc = networkUtils.getRPCEndpoint('mainnet-beta');
```

---

## Types

### `GameResources`
```typescript
interface GameResources {
  gold: number;
  energy: number;
  points: number;
  population?: number;
}
```

### `Building`
```typescript
interface Building {
  id: string;
  type: BuildingType;
  position: { x: number; y: number };
  level: number;
  builtAt: number;
  stats: BuildingStats;
}
```

### `BuildingType`
```typescript
type BuildingType =
  | 'residential_house'
  | 'residential_tower'
  | 'residential_district'
  | 'commercial_shop'
  | 'commercial_bank'
  | 'commercial_office'
  | 'industrial_factory'
  | 'industrial_plant'
  | 'industrial_power'
  | 'special_hospital'
  | 'special_university'
  | 'special_stadium';
```

### `Achievement`
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  requirements: AchievementRequirement[];
  rewardedAt?: number;
  nftMint?: string;
}
```

### `Player`
```typescript
interface Player {
  id: string;
  address: string;
  username: string;
  avatar?: string;
  level: number;
  experience: number;
  points: number;
  rank: number;
  achievements: string[];
  stats: PlayerStats;
}
```

### `WalletState`
```typescript
interface WalletState {
  connected: boolean;
  connecting: boolean;
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  balance: number;
  error: Error | null;
}
```

### `Transaction`
```typescript
interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'mint' | 'transfer';
  amount: number;
  token: string;
  from?: string;
  to?: string;
  signature: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}
```

---

## Events

### Game Events
```typescript
gameEngine.on('tick', (state) => {});
gameEngine.on('resourceUpdate', (resources) => {});
gameEngine.on('buildingPlaced', (building) => {});
gameEngine.on('achievementUnlocked', (achievement) => {});
gameEngine.on('levelUp', (level) => {});
gameEngine.on('gameOver', (stats) => {});
```

### Wallet Events
```typescript
walletService.on('connect', (wallet) => {});
walletService.on('disconnect', () => {});
walletService.on('error', (error) => {});
walletService.on('balanceChange', (balance) => {});
```

### Network Events
```typescript
networkService.on('networkChange', (network) => {});
networkService.on('statusChange', (status) => {});
networkService.on('rpcChange', (rpc) => {});
```

---

## Constants

### Networks
```typescript
const NETWORKS = {
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
} as const;
```

### Building Costs
```typescript
const BUILDING_COSTS = {
  house: { gold: 100, energy: 10 },
  tower: { gold: 500, energy: 25 },
  district: { gold: 2000, energy: 100 },
  shop: { gold: 200, energy: 15 },
  bank: { gold: 1000, energy: 50 },
  office: { gold: 3000, energy: 150 },
  factory: { gold: 300, energy: 30 },
  plant: { gold: 800, energy: 40 },
  power: { gold: 1500, energy: 0 },
} as const;
```

### Achievement Rarities
```typescript
const ACHIEVEMENT_RARITIES = {
  common: { weight: 60, color: '#94A3B8' },
  rare: { weight: 25, color: '#22D3EE' },
  epic: { weight: 10, color: '#A855F7' },
  legendary: { weight: 5, color: '#FBBF24' },
} as const;
```
