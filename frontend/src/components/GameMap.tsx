import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';

// ============================================================================
// Types
// ============================================================================

interface Position {
  x: number;
  y: number;
}

interface GridCell {
  x: number;
  y: number;
  building: BuildingInstance | null;
  terrain: TerrainType;
  isWalkable: boolean;
}

interface BuildingInstance {
  id: string;
  type: string;
  level: number;
  position: Position;
}

type TerrainType = 'grass' | 'water' | 'mountain' | 'desert' | 'forest';

interface GameMapProps {
  grid: GridCell[][];
  buildings: BuildingInstance[];
  selectedBuilding: string | null;
  onPlaceBuilding: (cell: GridCell, buildingType: string) => void;
  onRemoveBuilding: (buildingId: string) => void;
  onSelectCell: (cell: GridCell | null) => void;
  selectedCell: GridCell | null;
  zoom: number;
  pan: Position;
}

// ============================================================================
// Constants
// ============================================================================

const CELL_SIZE = 48;
const GRID_COLS = 20;
const GRID_ROWS = 15;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

const TERRAIN_COLORS: Record<TerrainType, string> = {
  grass: '#22C55E',
  water: '#3B82F6',
  mountain: '#6B7280',
  desert: '#F59E0B',
  forest: '#15803D',
};

const BUILDING_ICONS: Record<string, string> = {
  house: '🏠',
  mine: '⛏️',
  lumber_mill: '🪵',
  power_plant: '⚡',
  farm: '🌾',
  research_lab: '🔬',
};

// ============================================================================
// GameMap Component
// ============================================================================

const GameMap = memo(function GameMap({
  grid,
  buildings,
  selectedBuilding,
  onPlaceBuilding,
  onRemoveBuilding,
  onSelectCell,
  selectedCell,
  zoom: initialZoom = 1,
  pan: initialPan = { x: 0, y: 0 },
}: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState<Position>(initialPan);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPan, setLastPan] = useState<Position>({ x: 0, y: 0 });
  
  // Calculate visible grid range
  const getVisibleRange = useCallback(() => {
    const startCol = Math.max(0, Math.floor(-pan.x / (CELL_SIZE * zoom)));
    const endCol = Math.min(
      grid[0]?.length || GRID_COLS,
      Math.ceil((containerRef.current?.clientWidth || 800) / (CELL_SIZE * zoom)) + startCol + 1
    );
    const startRow = Math.max(0, Math.floor(-pan.y / (CELL_SIZE * zoom)));
    const endRow = Math.min(
      grid.length || GRID_ROWS,
      Math.ceil((containerRef.current?.clientHeight || 600) / (CELL_SIZE * zoom)) + startRow + 1
    );
    
    return { startCol, endCol, startRow, endRow };
  }, [grid, pan, zoom]);
  
  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { startCol, endCol, startRow, endRow } = getVisibleRange();
    
    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw terrain and cells
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const cell = grid[row]?.[col];
        if (!cell) continue;
        
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        
        // Draw terrain
        ctx.fillStyle = TERRAIN_COLORS[cell.terrain];
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Draw building
        if (cell.building) {
          const icon = BUILDING_ICONS[cell.building.type] || '🏢';
          ctx.font = `${CELL_SIZE * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
          
          // Draw level indicator
          if (cell.building.level > 1) {
            ctx.fillStyle = '#FBBF24';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`Lv${cell.building.level}`, x + CELL_SIZE - 10, y + 10);
          }
        }
        
        // Draw selection highlight
        if (selectedCell?.x === col && selectedCell?.y === row) {
          ctx.strokeStyle = '#6366F1';
          ctx.lineWidth = 3 / zoom;
          ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        }
      }
    }
    
    ctx.restore();
    
    // Draw ghost building if selecting
    if (selectedBuilding) {
      const { startCol: sCol, endCol: eCol, startRow: sRow, endRow: eRow } = getVisibleRange();
      const mouseX = (lastPan.x - pan.x) / zoom;
      const mouseY = (lastPan.y - pan.y) / zoom;
      
      const col = Math.floor(mouseX / CELL_SIZE);
      const row = Math.floor(mouseY / CELL_SIZE);
      
      if (col >= sCol && col < eCol && row >= sRow && row < eRow) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        
        // Ghost building
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = TERRAIN_COLORS.grass;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        const icon = BUILDING_ICONS[selectedBuilding] || '🏢';
        ctx.globalAlpha = 1;
        ctx.font = `${CELL_SIZE * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        
        // Placement preview
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.setLineDash([]);
        
        ctx.restore();
      }
    }
  }, [grid, buildings, selectedCell, selectedBuilding, pan, zoom, getVisibleRange, lastPan]);
  
  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse or Alt+Click for panning
      setIsDragging(true);
      setLastPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor((x - pan.x) / (CELL_SIZE * zoom));
    const row = Math.floor((y - pan.y) / (CELL_SIZE * zoom));
    
    const cell = grid[row]?.[col];
    if (!cell) return;
    
    if (selectedBuilding && !cell.building && cell.isWalkable) {
      // Place building
      onPlaceBuilding(cell, selectedBuilding);
    } else if (cell.building) {
      // Select cell
      onSelectCell(cell);
    } else {
      onSelectCell(null);
    }
  }, [grid, selectedBuilding, pan, zoom, onPlaceBuilding, onSelectCell]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - lastPan.x,
        y: e.clientY - lastPan.y,
      });
      return;
    }
    
    // Update ghost position
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastPan({ x, y });
  }, [isDragging, lastPan]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    setZoom(newZoom);
  }, [zoom]);
  
  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setLastPan({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  }, [pan]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - lastPan.x,
        y: touch.clientY - lastPan.y,
      });
    }
  }, [lastPan]);
  
  // Reset view
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  
  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const mapWidth = GRID_COLS * CELL_SIZE;
    const mapHeight = GRID_ROWS * CELL_SIZE;
    
    const scaleX = containerWidth / mapWidth;
    const scaleY = containerHeight / mapHeight;
    const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);
    
    setZoom(newZoom);
    setPan({
      x: (containerWidth - mapWidth * newZoom) / 2,
      y: (containerHeight - mapHeight * newZoom) / 2,
    });
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="game-map relative w-full h-full overflow-hidden bg-slate-900"
      role="img"
      aria-label="Interactive game map"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 0.2))}
          className="p-2 bg-slate-800 rounded-lg shadow-lg hover:bg-slate-700"
          aria-label="Zoom in"
        >
          🔍+
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - 0.2))}
          className="p-2 bg-slate-800 rounded-lg shadow-lg hover:bg-slate-700"
          aria-label="Zoom out"
        >
          🔍-
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFitToScreen}
          className="p-2 bg-slate-800 rounded-lg shadow-lg hover:bg-slate-700"
          aria-label="Fit to screen"
        >
          ⬜
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleResetView}
          className="p-2 bg-slate-800 rounded-lg shadow-lg hover:bg-slate-700"
          aria-label="Reset view"
        >
          🔄
        </motion.button>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-slate-800/80 rounded-full text-sm text-white">
        {Math.round(zoom * 100)}%
      </div>
      
      {/* Mini-map indicator */}
      <div className="absolute top-4 right-4 w-32 h-24 bg-slate-800/80 rounded-lg border border-slate-700">
        <div className="w-full h-full relative">
          {/* Mini-map grid preview */}
          <div 
            className="absolute border-2 border-indigo-500"
            style={{
              left: `${Math.max(0, -pan.x / (CELL_SIZE * zoom * GRID_COLS) * 100)}%`,
              top: `${Math.max(0, -pan.y / (CELL_SIZE * zoom * GRID_ROWS) * 100)}%`,
              width: `${(containerRef.current?.clientWidth || 800) / (CELL_SIZE * zoom) / GRID_COLS * 100}%`,
              height: `${(containerRef.current?.clientHeight || 600) / (CELL_SIZE * zoom) / GRID_ROWS * 100}%`,
            }}
          />
        </div>
      </div>
      
      {/* Instructions */}
      <AnimatePresence>
        {zoom < 0.7 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 left-4 px-4 py-2 bg-indigo-500/20 backdrop-blur-sm rounded-lg text-sm text-indigo-200"
          >
            Use scroll to zoom • Drag to pan • Click to place buildings
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GameMap;
export type { GameMapProps, GridCell, BuildingInstance, TerrainType, Position };
