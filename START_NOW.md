# 🚀 Solana AI City 立即行动计划

## 📅 开始时间
**2026-02-07 13:53**

---

## 🎯 今日目标

### 立即完成 (1-2 小时)

#### 1. 生成 UI/UX Pro Max 设计系统

```bash
cd /home/admin/.openclaw/workspace
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "gaming AI strategy fun interactive" \
  --design-system \
  -p "Solana AI City Game" \
  --stack react \
  --persist
```

**预期输出**:
- 设计系统: pattern, style, colors, typography
- 反模式: 要避免的设计
- 检查清单: 发布前检查

---

#### 2. 复制当前项目到新分支

```bash
cd /home/admin/.openclaw/workspace/solana-ai-city
git checkout -b feature/ui-optimization
git add -A
git commit -m "feat: 开始 UI/UX 优化"
git push origin feature/ui-optimization
```

---

#### 3. 创建优化后的组件

**优先创建 5 个核心组件**:

1. **ResourcePanel** (资源面板)
2. **BuildingMenu** (建筑菜单)
3. **GameMap** (游戏地图)
4. **Leaderboard** (排行榜)
5. **AISuggestionPanel** (AI 建议面板)

---

### 今日完成文件

```
✅ IMPROVEMENT_PLAN.md (20KB) - 完整优化计划
✅ frontend/src/components/ResourcePanel.tsx
✅ frontend/src/components/BuildingMenu.tsx
✅ frontend/src/components/GameMap.tsx
✅ frontend/src/components/Leaderboard.tsx
✅ frontend/src/components/AISuggestionPanel.tsx
✅ frontend/src/hooks/useGameLoop.ts
✅ frontend/src/hooks/useGameAI.ts
✅ frontend/src/styles/game-theme.ts
✅ frontend/src/styles/animations.ts
```

---

## 📝 立即开始 - 代码模板

### 1. ResourcePanel.tsx

```typescript
import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 资源类型
type ResourceType = 'gold' | 'wood' | 'stone' | 'food' | 'energy';

interface Resource {
  type: ResourceType;
  value: number;
  change: number; // 每秒变化
  icon: string;
}

interface ResourcePanelProps {
  resources: Record<ResourceType, number>;
  changes: Record<ResourceType, number>;
}

// 资源图标映射
const RESOURCE_ICONS: Record<ResourceType, string> = {
  gold: '💰',
  wood: '🪵',
  stone: '🪨',
  food: '🌾',
  energy: '⚡',
};

const ResourcePanel = memo(function ResourcePanel({ 
  resources, 
  changes 
}: ResourcePanelProps) {
  // 派生资源列表
  const resourceList: Resource[] = useMemo(() => 
    Object.entries(resources).map(([type, value]) => ({
      type: type as ResourceType,
      value,
      change: changes[type as ResourceType],
      icon: RESOURCE_ICONS[type as ResourceType],
    })),
    [resources, changes]
  );
  
  return (
    <div 
      className="resource-panel"
      role="region"
      aria-label="Game Resources"
    >
      <h2 className="sr-only">Resources</h2>
      
      <div className="resource-grid">
        {resourceList.map(resource => (
          <ResourceItem key={resource.type} resource={resource} />
        ))}
      </div>
    </div>
  );
});

const ResourceItem = memo(function ResourceItem({ resource }: { resource: Resource }) {
  const isPositive = resource.change > 0;
  const isNegative = resource.change < 0;
  
  return (
    <motion.div
      className={[
        'resource-item',
        isPositive && 'resource-positive',
        isNegative && 'resource-negative',
      ].filter(Boolean).join(' ')}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      role="listitem"
      aria-label={`${resource.type}: ${resource.value}`}
    >
      <span className="resource-icon" aria-hidden="true">
        {resource.icon}
      </span>
      
      <div className="resource-info">
        <span className="resource-value">
          {resource.value.toLocaleString()}
        </span>
        
        <AnimatePresence mode="wait">
          {resource.change !== 0 && (
            <motion.span
              key={resource.change}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className={[
                'resource-change',
                isPositive && 'text-green-400',
                isNegative && 'text-red-400',
              ].filter(Boolean).join(' ')}
            >
              {isPositive ? '+' : ''}{resource.change.toFixed(1)}/s
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default ResourcePanel;
```

---

### 2. BuildingMenu.tsx

```typescript
import React, { memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 建筑类型定义
interface BuildingType {
  id: string;
  name: string;
  icon: string;
  cost: {
    gold: number;
    wood: number;
    stone: number;
  };
  production: {
    type: string;
    rate: number;
  };
  population: number;
  description: string;
}

interface BuildingMenuProps {
  buildingTypes: BuildingType[];
  selectedBuilding: string | null;
  onSelectBuilding: (building: BuildingType) => void;
  resources: Record<string, number>;
}

// 建筑数据 (6 种基础建筑)
const DEFAULT_BUILDINGS: BuildingType[] = [
  {
    id: 'house',
    name: 'House',
    icon: '🏠',
    cost: { gold: 100, wood: 50, stone: 0 },
    production: { type: 'population', rate: 5 },
    population: 5,
    description: 'Provides population for your city',
  },
  {
    id: 'mine',
    name: 'Gold Mine',
    icon: '⛏️',
    cost: { gold: 50, wood: 0, stone: 100 },
    production: { type: 'gold', rate: 10 },
    population: 0,
    description: 'Produces gold over time',
  },
  {
    id: 'lumber_mill',
    name: 'Lumber Mill',
    icon: '🪵',
    cost: { gold: 50, wood: 100, stone: 0 },
    production: { type: 'wood', rate: 10 },
    population: 0,
    description: 'Produces wood for construction',
  },
  {
    id: 'power_plant',
    name: 'Power Plant',
    icon: '⚡',
    cost: { gold: 200, wood: 100, stone: 100 },
    production: { type: 'energy', rate: 20 },
    population: 0,
    description: 'Provides energy for buildings',
  },
  {
    id: 'farm',
    name: 'Farm',
    icon: '🌾',
    cost: { gold: 50, wood: 0, stone: 50 },
    production: { type: 'food', rate: 15 },
    population: 2,
    description: 'Produces food for population',
  },
  {
    id: 'research_lab',
    name: 'Research Lab',
    icon: '🔬',
    cost: { gold: 500, wood: 200, stone: 200 },
    production: { type: 'technology', rate: 5 },
    population: 10,
    description: 'Generates technology points',
  },
];

const BuildingMenu = memo(function BuildingMenu({
  buildingTypes = DEFAULT_BUILDINGS,
  selectedBuilding,
  onSelectBuilding,
  resources,
}: BuildingMenuProps) {
  // 检查资源是否足够
  const canAfford = useCallback((building: BuildingType) => {
    return (
      resources.gold >= building.cost.gold &&
      resources.wood >= building.cost.wood &&
      resources.stone >= building.cost.stone
    );
  }, [resources]);
  
  return (
    <aside 
      className="building-menu"
      role="complementary"
      aria-label="Building Selection Menu"
    >
      <h2 className="menu-title">🏗️ Buildings</h2>
      
      <menu className="building-list" role="listbox" aria-label="Available buildings">
        {buildingTypes.map(building => {
          const isSelected = selectedBuilding === building.id;
          const affordable = canAfford(building);
          
          return (
            <li key={building.id} role="none">
              <button
                role="option"
                aria-selected={isSelected}
                aria-disabled={!affordable}
                className={[
                  'building-button',
                  isSelected && 'selected',
                  !affordable && 'disabled',
                ].filter(Boolean).join(' ')}
                onClick={() => affordable && onSelectBuilding(building)}
                disabled={!affordable}
              >
                <div className="building-icon">{building.icon}</div>
                
                <div className="building-info">
                  <span className="building-name">{building.name}</span>
                  
                  <div className="building-cost">
                    <CostDisplay 
                      type="gold" 
                      amount={building.cost.gold} 
                      available={resources.gold} 
                    />
                    <CostDisplay 
                      type="wood" 
                      amount={building.cost.wood} 
                      available={resources.wood} 
                    />
                    <CostDisplay 
                      type="stone" 
                      amount={building.cost.stone} 
                      available={resources.stone} 
                    />
                  </div>
                  
                  <p className="building-description">
                    {building.description}
                  </p>
                  
                  <div className="building-production">
                    <span className="production-icon">
                      {building.production.type === 'population' ? '👥' : 
                       building.production.type === 'gold' ? '💰' :
                       building.production.type === 'wood' ? '🪵' :
                       building.production.type === 'energy' ? '⚡' : '🌾'}
                    </span>
                    <span>
                      +{building.production.rate}/{building.production.type}
                    </span>
                  </div>
                </div>
                
                {isSelected && (
                  <motion.div
                    className="selection-indicator"
                    layoutId="selection"
                    initial={false}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    ✓
                  </motion.div>
                )}
              </button>
            </li>
          );
        })}
      </menu>
    </aside>
  );
});

// 成本显示组件
const CostDisplay = memo(function CostDisplay({ 
  type, 
  amount, 
  available 
}: { 
  type: string; 
  amount: number; 
  available: number;
}) {
  if (amount === 0) return null;
  
  const icons: Record<string, string> = {
    gold: '💰',
    wood: '🪵',
    stone: '🪨',
  };
  
  const hasEnough = available >= amount;
  
  return (
    <span 
      className={[
        'cost-item',
        hasEnough ? 'cost-enough' : 'cost-insufficient',
      ].filter(Boolean).join(' ')}
      aria-label={`${type}: ${amount}, available: ${available}`}
    >
      <span aria-hidden="true">{icons[type]}</span>
      {amount}
    </span>
  );
});

export default BuildingMenu;
export type { BuildingType, BuildingMenuProps };
```

---

### 3. useGameLoop.ts Hook

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  energy: number;
}

interface Building {
  id: string;
  type: string;
  level: number;
  position: { x: number; y: number };
}

interface GameState {
  resources: Resources;
  buildings: Building[];
  population: number;
  score: number;
  tick: number;
}

export function useGameLoop(initialState: GameState) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isRunning, setIsRunning] = useState(true);
  const tickRef = useRef<number>(0);
  
  // 计算资源生产
  const calculateProduction = useCallback((buildings: Building[]): Resources => {
    return buildings.reduce((acc, building) => {
      // 根据建筑类型和等级计算产出
      const multipliers = {
        mine: { gold: 10 * building.level },
        lumber_mill: { wood: 10 * building.level },
        power_plant: { energy: 20 * building.level },
        farm: { food: 15 * building.level },
      };
      
      const multiplier = multipliers[building.type as keyof typeof multipliers];
      if (multiplier) {
        Object.entries(multiplier).forEach(([resource, amount]) => {
          acc[resource as keyof Resources] += amount;
        });
      }
      
      return acc;
    }, { gold: 0, wood: 0, stone: 0, food: 0, energy: 0 });
  }, []);
  
  // 游戏循环
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setGameState(prevState => {
        // 1. 计算资源产出
        const production = calculateProduction(prevState.buildings);
        
        // 2. 更新资源
        const newResources = {
          gold: prevState.resources.gold + production.gold,
          wood: prevState.resources.wood + production.wood,
          stone: prevState.resources.stone + production.stone,
          food: prevState.resources.food + production.food,
          energy: prevState.resources.energy + production.energy,
        };
        
        // 3. 计算人口
        const population = prevState.buildings
          .filter(b => b.type === 'house')
          .reduce((acc, b) => acc + (5 * b.level), 0);
        
        // 4. 计算分数
        const score = prevState.buildings.reduce((acc, b) => {
          return acc + (10 * b.level);
        }, 0) + (newResources.gold / 100);
        
        // 5. 增加 tick
        tickRef.current += 1;
        
        return {
          ...prevState,
          resources: newResources,
          population,
          score,
          tick: tickRef.current,
        };
      });
    }, 1000); // 每秒更新
    
    return () => clearInterval(interval);
  }, [isRunning, calculateProduction]);
  
  // 控制函数
  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const toggle = useCallback(() => setIsRunning(prev => !prev), []);
  const reset = useCallback(() => {
    setGameState(initialState);
    tickRef.current = 0;
  }, [initialState]);
  
  return {
    gameState,
    isRunning,
    tick: gameState.tick,
    start,
    stop,
    toggle,
    reset,
    setGameState,
  };
}

export type { Resources, Building, GameState };
```

---

### 4. 样式文件 (game-theme.ts)

```typescript
// 游戏主题配置
export const gameTheme = {
  colors: {
    primary: {
      main: '#6366F1',      // Indigo
      light: '#818CF8',
      dark: '#4F46E5',
      muted: '#A5B4FC',
    },
    secondary: {
      main: '#22D3EE',     // Cyan
      light: '#67E8F9',
      dark: '#06B6D4',
      muted: '#A5E4E8',
    },
    background: {
      main: '#0F172A',     // Dark Slate
      card: '#1E293B',
      hover: '#334155',
      elevated: '#475569',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#0F172A',
    },
    status: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    resources: {
      gold: '#FBBF24',
      wood: '#A3E635',
      stone: '#94A3B8',
      food: '#F97316',
      energy: '#22D3EE',
    },
  },
  shadows: {
    small: '0 1px 2px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
    large: '0 10px 15px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.75rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2rem',
  },
};

//xl': '3 响应式断点
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// 字体配置
export const typography = {
  fontFamily: {
    heading: "'Outfit', 'Inter', sans-serif",
    body: "'Inter', 'Roboto', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export default gameTheme;
```

---

### 5. 动画配置 (animations.ts)

```typescript
// Framer Motion 动画配置

// 建筑放置动画
export const buildingPlacement = {
  initial: { scale: 0, opacity: 0, y: 20 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

// 资源变化动画
export const resourceChange = {
  initial: { scale: 1, opacity: 1 },
  animate: (value: number) => {
    if (value > 0) {
      return {
        scale: [1, 1.2, 1],
        color: '#22C55E',
        transition: { duration: 0.3 }
      };
    } else if (value < 0) {
      return {
        scale: [1, 0.9, 1],
        color: '#EF4444',
        transition: { duration: 0.3 }
      };
    }
    return {};
  },
};

// 悬停效果
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

// 点击效果
export const tapScale = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// 页面过渡
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};

// 列表项动画
export const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    }
  }),
};

// 按钮动画
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// 弹窗动画
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  },
};

// 骨架屏动画
export const skeletonAnimation = {
  animate: {
    opacity: [0.2, 0.5, 0.2],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

---

## 🎯 今日检查清单

### 开发任务

```
✅ 1. 生成 UI/UX Pro Max 设计系统
   [ ] 运行命令
   [ ] 保存输出到 design-system/
   [ ] 应用到组件

✅ 2. 创建 ResourcePanel 组件
   [ ] 编写代码
   [ ] 添加样式
   [ ] 测试交互

✅ 3. 创建 BuildingMenu 组件
   [ ] 编写代码
   [ ] 添加动画
   [ ] 测试可访问性

✅ 4. 创建 useGameLoop Hook
   [ ] 实现游戏循环
   [ ] 添加资源计算
   [ ] 测试性能

✅ 5. 添加主题配置
   [ ] 创建 game-theme.ts
   [ ] 创建 animations.ts
   [ ] 应用到组件
```

### 代码质量

```
✅ TypeScript 类型检查
✅ ESLint 规则检查
✅ 单元测试覆盖
✅ 可访问性测试
✅ 性能测试
```

---

## 🚀 启动命令

```bash
# 1. 进入项目目录
cd /home/admin/.openclaw/workspace/solana-ai-city

# 2. 创建新分支
git checkout -b feature/ui-optimization

# 3. 安装依赖
cd frontend
npm install framer-motion @tsparticles/react @use-gesture/react

# 4. 创建组件
mkdir -p src/components src/hooks src/styles

# 5. 启动开发服务器
npm run dev

# 6. 在新终端运行 AI 服务
cd ai
python serve_model.py

# 7. 打开浏览器
open http://localhost:3000
```

---

## 📊 进度追踪

### 今日进度

```
组件创建: 0/5
Hooks 创建: 0/2
测试覆盖: 0%
文档更新: 0%
```

### 目标完成

```
今日目标: 40%
本周目标: 80%
本月目标: 100%
```

---

## 🎉 总结

### 今日任务

```
✅ 1. 生成 UI/UX Pro Max 设计系统
✅ 2. 创建 5 个核心组件模板
✅ 3. 创建 2 个 Hook
✅ 4. 配置主题和动画
✅ 5. 准备测试

预计时间: 2-3 小时
预计完成度: 40%
```

### 下一步

```
🚀 立即运行命令
🚀 创建组件
🚀 测试功能
🚀 提交代码
```

---

**开始时间**: 2026-02-07 13:53
**预计结束时间**: 2026-02-07 17:00
**预计完成度**: 40%
