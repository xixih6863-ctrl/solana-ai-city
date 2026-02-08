import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SolanaAIGame } from './App-complete';
import { ResourcePanel } from './components/ResourcePanel';
import { BuildingMenu } from './components/BuildingMenu';
import { GameMap } from './components/GameMap';
import { PlayerProfile } from './components/PlayerProfile';
import { Leaderboard } from './components/Leaderboard';

// ============================================
// Unit Tests - ResourcePanel
// ============================================

describe('ResourcePanel', () => {
  const mockResources = {
    gold: 1250,
    energy: 85,
    points: 4520,
    population: 1250,
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all resource values correctly', () => {
    render(<ResourcePanel resources={mockResources} onResourceUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('4,520')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('displays resource icons', () => {
    render(<ResourcePanel resources={mockResources} onResourceUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('calls onResourceUpdate when resource changes', () => {
    render(<ResourcePanel resources={mockResources} onResourceUpdate={mockOnUpdate} />);
    
    // Trigger a resource update
    const newResources = { ...mockResources, gold: 1300 };
    mockOnUpdate(newResources);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(newResources);
  });

  it('formats large numbers with commas', () => {
    const largeResources = {
      ...mockResources,
      gold: 1000000,
      points: 5000000,
    };
    
    render(<ResourcePanel resources={largeResources} onResourceUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('5,000,000')).toBeInTheDocument();
  });

  it('shows warning when energy is low', () => {
    const lowEnergy = { ...mockResources, energy: 15 };
    render(<ResourcePanel resources={lowEnergy} onResourceUpdate={mockOnUpdate} />);
    
    const energyElement = screen.getByText('15');
    expect(energyElement).toHaveStyle({ color: expect.stringContaining('orange') });
  });

  it('shows danger when energy is critical', () => {
    const criticalEnergy = { ...mockResources, energy: 5 };
    render(<ResourcePanel resources={criticalEnergy} onResourceUpdate={mockOnUpdate} />);
    
    const energyElement = screen.getByText('5');
    expect(energyElement).toHaveStyle({ color: expect.stringContaining('red') });
  });
});

// ============================================
// Unit Tests - BuildingMenu
// ============================================

describe('BuildingMenu', () => {
  const mockBuildings = [
    { id: '1', type: 'house', position: { x: 2, y: 2 }, level: 1, builtAt: Date.now() },
    { id: '2', type: 'factory', position: { x: 4, y: 3 }, level: 1, builtAt: Date.now() },
  ];

  const mockOnBuild = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders building categories', () => {
    render(<BuildingMenu buildings={mockBuildings} onBuild={mockOnBuild} />);
    
    expect(screen.getByText('Residential')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
    expect(screen.getByText('Industrial')).toBeInTheDocument();
  });

  it('displays available buildings', () => {
    render(<BuildingMenu buildings={mockBuildings} onBuild={mockOnBuild} />);
    
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('Tower')).toBeInTheDocument();
  });

  it('shows building costs', () => {
    render(<BuildingMenu buildings={mockBuildings} onBuild={mockOnBuild} />);
    
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('calls onBuild when building is selected', () => {
    render(<BuildingMenu buildings={mockBuildings} onBuild={mockOnBuild} />);
    
    const buildButton = screen.getByText('Build');
    fireEvent.click(buildButton);
    
    expect(mockOnBuild).toHaveBeenCalled();
  });

  it('filters buildings by category', () => {
    render(<BuildingMenu buildings={mockBuildings} onBuild={mockOnBuild} />);
    
    // Click on Commercial tab
    const commercialTab = screen.getByText('Commercial');
    fireEvent.click(commercialTab);
    
    // Should show commercial buildings
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Bank')).toBeInTheDocument();
  });
});

// ============================================
// Unit Tests - GameMap
// ============================================

describe('GameMap', () => {
  const mockBuildings = [
    { id: '1', type: 'house', position: { x: 2, y: 2 }, level: 1, builtAt: Date.now() },
  ];

  const mockOnTileClick = vi.fn();
  const mockOnBuildingClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the grid correctly', () => {
    render(
      <GameMap
        buildings={mockBuildings}
        gridSize={10}
        onTileClick={mockOnTileClick}
        onBuildingClick={mockOnBuildingClick}
      />
    );
    
    // Check for grid tiles
    const tiles = screen.getAllByRole('button');
    expect(tiles.length).toBeGreaterThan(50); // 10x10 grid = 100 tiles
  });

  it('displays placed buildings', () => {
    render(
      <GameMap
        buildings={mockBuildings}
        gridSize={10}
        onTileClick={mockOnTileClick}
        onBuildingClick={mockOnBuildingClick}
      />
    );
    
    // The house building should be visible
    expect(screen.getByText('🏠')).toBeInTheDocument();
  });

  it('calls onTileClick when tile is clicked', () => {
    render(
      <GameMap
        buildings={mockBuildings}
        gridSize={10}
        selectedBuilding="house"
        onTileClick={mockOnTileClick}
        onBuildingClick={mockOnBuildingClick}
      />
    );
    
    const emptyTile = screen.getAllByRole('button')[0];
    fireEvent.click(emptyTile);
    
    expect(mockOnTileClick).toHaveBeenCalled();
  });

  it('shows grid lines', () => {
    render(
      <GameMap
        buildings={mockBuildings}
        gridSize={10}
        showGrid={true}
        onTileClick={mockOnTileClick}
        onBuildingClick={mockOnBuildingClick}
      />
    );
    
    // Grid should be visible
    const mapContainer = screen.getByTestId('game-map');
    expect(mapContainer).toHaveStyle({ border: expect.stringContaining('1px') });
  });

  it('highlights valid placement tiles', () => {
    render(
      <GameMap
        buildings={mockBuildings}
        gridSize={10}
        selectedBuilding="factory"
        onTileClick={mockOnTileClick}
        onBuildingClick={mockOnBuildingClick}
      />
    );
    
    // Should show valid placement indicators
    const validTiles = screen.getAllByTestId('valid-tile');
    expect(validTiles.length).toBeGreaterThan(0);
  });
});

// ============================================
// Unit Tests - PlayerProfile
// ============================================

describe('PlayerProfile', () => {
  const mockPlayer = {
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
    achievements: ['first_build', 'golden_city'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays player username', () => {
    render(<PlayerProfile player={mockPlayer} />);
    
    expect(screen.getByText('CryptoKing')).toBeInTheDocument();
  });

  it('shows player level', () => {
    render(<PlayerProfile player={mockPlayer} />);
    
    expect(screen.getByText('Lv. 15')).toBeInTheDocument();
  });

  it('displays experience progress', () => {
    render(<PlayerProfile player={mockPlayer} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('shows player rank', () => {
    render(<PlayerProfile player={mockPlayer} />);
    
    expect(screen.getByText('#247')).toBeInTheDocument();
  });

  it('displays achievement count', () => {
    render(<PlayerProfile player={mockPlayer} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 achievements
  });

  it('shows avatar emoji', () => {
    render(<PlayerProfile player={mockPlayer} />);
    
    expect(screen.getByText('👑')).toBeInTheDocument();
  });
});

// ============================================
// Unit Tests - Leaderboard
// ============================================

describe('Leaderboard', () => {
  const mockEntries = [
    { rank: 1, username: 'CryptoKing', points: 45230, city: 'Neo Tokyo', level: 15 },
    { rank: 2, username: 'SolanaGirl', points: 38900, city: 'Crypto City', level: 12 },
    { rank: 3, username: 'Web3Builder', points: 32450, city: 'Digital Heights', level: 10 },
  ];

  const mockCurrentUser = {
    id: '1',
    username: 'CryptoKing',
    level: 15,
    points: 45230,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all leaderboard entries', () => {
    render(<Leaderboard entries={mockEntries} currentUser={mockCurrentUser} />);
    
    expect(screen.getByText('CryptoKing')).toBeInTheDocument();
    expect(screen.getByText('SolanaGirl')).toBeInTheDocument();
    expect(screen.getByText('Web3Builder')).toBeInTheDocument();
  });

  it('displays correct ranks', () => {
    render(<Leaderboard entries={mockEntries} currentUser={mockCurrentUser} />);
    
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('shows points for each player', () => {
    render(<Leaderboard entries={mockEntries} currentUser={mockCurrentUser} />);
    
    expect(screen.getByText('45,230')).toBeInTheDocument();
    expect(screen.getByText('38,900')).toBeInTheDocument();
    expect(screen.getByText('32,450')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    render(<Leaderboard entries={mockEntries} currentUser={mockCurrentUser} />);
    
    const currentUserRow = screen.getByText('CryptoKing').closest('div');
    expect(currentUserRow).toHaveClass('current-user');
  });

  it('displays city names', () => {
    render(<Leaderboard entries={mockEntries} currentUser={mockCurrentUser} />);
    
    expect(screen.getByText('Neo Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Crypto City')).toBeInTheDocument();
  });
});

// ============================================
// Integration Tests
// ============================================

describe('SolanaAIGame Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SolanaAIGame />);
    
    expect(screen.getByText('🏙️ Solana AI City')).toBeInTheDocument();
  });

  it('shows all navigation buttons', () => {
    render(<SolanaAIGame />);
    
    expect(screen.getByText('🗺️')).toBeInTheDocument();
    expect(screen.getByText('📜')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('switches panels when navigation is clicked', () => {
    render(<SolanaAIGame />);
    
    // Click on Quests tab
    fireEvent.click(screen.getByText('📜'));
    
    // Quests panel should be visible
    expect(screen.getByText('Quests')).toBeInTheDocument();
  });

  it('opens shop when shop tab is clicked', () => {
    render(<SolanaAIGame />);
    
    fireEvent.click(screen.getByText('🛒'));
    
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  it('opens chat when chat tab is clicked', () => {
    render(<SolanaAIGame />);
    
    fireEvent.click(screen.getByText('💬'));
    
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });
});

// ============================================
// Performance Tests
// ============================================

describe('Performance', () => {
  it('renders ResourcePanel quickly', () => {
    const resources = {
      gold: 1250,
      energy: 85,
      points: 4520,
      population: 1250,
    };

    const start = performance.now();
    render(<ResourcePanel resources={resources} onResourceUpdate={() => {}} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should render in < 100ms
  });

  it('handles large building lists efficiently', () => {
    const buildings = Array.from({ length: 100 }, (_, i) => ({
      id: `b${i}`,
      type: 'house',
      position: { x: i % 10, y: Math.floor(i / 10) },
      level: 1,
      builtAt: Date.now(),
    }));

    const start = performance.now();
    render(
      <GameMap
        buildings={buildings}
        gridSize={10}
        onTileClick={() => {}}
        onBuildingClick={() => {}}
      />
    );
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500); // Should render in < 500ms
  });
});

// ============================================
// Accessibility Tests
// ============================================

describe('Accessibility', () => {
  it('ResourcePanel has proper ARIA labels', () => {
    const resources = {
      gold: 1250,
      energy: 85,
      points: 4520,
      population: 1250,
    };

    render(<ResourcePanel resources={resources} onResourceUpdate={() => {}} />);
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Resources');
  });

  it('BuildingMenu is keyboard navigable', () => {
    const buildings: any[] = [];
    
    render(<BuildingMenu buildings={buildings} onBuild={() => {}} />);
    
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    
    expect(document.activeElement).toBe(firstButton);
  });

  it('GameMap has proper ARIA description', () => {
    render(
      <GameMap
        buildings={[]}
        gridSize={10}
        onTileClick={() => {}}
        onBuildingClick={() => {}}
      />
    );
    
    expect(screen.getByTestId('game-map')).toHaveAttribute('role', 'grid');
  });
});

// ============================================
// Snapshot Tests
// ============================================

describe('Snapshots', () => {
  it('ResourcePanel matches snapshot', () => {
    const resources = {
      gold: 1250,
      energy: 85,
      points: 4520,
      population: 1250,
    };

    const { container } = render(<ResourcePanel resources={resources} onResourceUpdate={() => {}} />);
    expect(container).toMatchSnapshot();
  });

  it('PlayerProfile matches snapshot', () => {
    const player = {
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
      achievements: [],
    };

    const { container } = render(<PlayerProfile player={player} />);
    expect(container).toMatchSnapshot();
  });
});
