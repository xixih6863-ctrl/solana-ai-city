/**
 * Solana AI City - Gacha/Lottery UI Component
 * 抽奖/盲盒界面组件
 */

import { lottery, lotteryStats, canFreeDraw, getBoxInfo, formatRarity, LOOT_TABLE } from './lottery';
import { usdc, gold } from './resources';

// ===============================
// Loot Box Card Component
// ===============================

/*
// Usage:
import { LootBoxCard, GachaAnimation, InventoryDisplay } from './GachaComponents';

<LootBoxCard 
  boxType="legendary"
  onOpen={handleOpenBox}
/>
*/

interface LootBoxCardProps {
  boxType: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  onOpen: (boxType: string) => void;
}

function LootBoxCard({ boxType, onOpen }: LootBoxCardProps) {
  const boxInfo = getBoxInfo(boxType);
  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
    mythic: 'from-pink-400 to-red-500',
  };
  
  return {
    // Render JSX
    type: 'div',
    props: {
      className: `loot-box-card bg-gradient-to-br ${rarityColors[boxType]} rounded-xl p-6 text-center`,
      children: [
        {
          type: 'div',
          props: {
            className: 'box-icon text-6xl mb-4',
            children: boxType === 'common' ? '📦' : 
                      boxType === 'rare' ? '🎁' : 
                      boxType === 'epic' ? '💎' : 
                      boxType === 'legendary' ? '👑' : '🌟',
          }
        },
        {
          type: 'h3',
          props: {
            className: 'text-xl font-bold mb-2',
            children: `${boxInfo.name}`,
          }
        },
        {
          type: 'div',
          props: {
            className: 'price text-lg mb-4',
            children: `💎 ${boxInfo.price} USDC`,
          }
        },
        {
          type: 'div',
          props: {
            className: 'probabilities text-sm mb-4',
            children: [
              { type: 'span', props: { children: `🌟 ${(boxInfo.probabilities.mythic / 100).toFixed(2)}%` } },
              { type: 'span', props: { children: ` 👑 ${(boxInfo.probabilities.legendary / 100).toFixed(2)}%` } },
              { type: 'span', props: { children: ` 💎 ${(boxInfo.probabilities.epic / 100).toFixed(2)}%` } },
            ],
          }
        },
        {
          type: 'button',
          props: {
            className: 'bg-white text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transition',
            onClick: () => onOpen(boxType),
            children: '开启盲盒',
          }
        },
      ],
    },
  };
}

// ===============================
// Gacha Animation Component
// ===============================

interface GachaAnimationProps {
  item: typeof LOOT_TABLE.mythic[0];
  isNew: boolean;
  onComplete: () => void;
}

function GachaAnimation({ item, isNew, onComplete }: GachaAnimationProps) {
  const rarityColors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ec4899',
  };
  
  return {
    // Animation states
    states: [
      'IDLE',     // 空闲
      'SPINNING', // 转动中
      'REVEAL',   // 揭示
      'CELEBRATE', // 庆祝
      'COMPLETE', // // 完成
    ],
    
    // Particle effects
    particles: isNew ? 50 : 20,
    
    // Sound effects
    sound: item.rarity === 'mythic' ? 'mythic_reveal.mp3' :
           item.rarity === 'legendary' ? 'legendary_reveal.mp3' :
           'common_reveal.mp3',
  };
}

// ===============================
// Inventory Display
// ===============================

interface InventoryDisplayProps {
  items: typeof lottery.inventory;
  onUseItem: (itemId: string) => void;
}

function InventoryDisplay({ items, onUseItem }: InventoryDisplayProps) {
  return {
    // Group items by rarity
    groupedItems: {
      mythic: items.filter(i => LOOT_TABLE.mythic.find(t => t.id === i.itemId)),
      legendary: items.filter(i => LOOT_TABLE.legendary.find(t => t.id === i.itemId)),
      epic: items.filter(i => LOOT_TABLE.epic.find(t => t.id === i.itemId)),
      rare: items.filter(i => LOOT_TABLE.rare.find(t => t.id === i.itemId)),
      common: items.filter(i => LOOT_TABLE.common.find(t => t.id === i.itemId)),
    },
    
    // Render grid
    renderItem: (item: typeof items[0]) => {
      const lootItem = [...Object.values(LOOT_TABLE).flat()].find(t => t.id === item.itemId);
      if (!lootItem) return null;
      
      return {
        type: 'div',
        props: {
          className: `item-card p-2 bg-gray-800 rounded-lg`,
          children: [
            { type: 'div', props: { className: 'text-2xl', children: formatRarity(lootItem.rarity).split(' ')[0] } },
            { type: 'div', props: { className: 'text-sm', children: lootItem.name } },
            { type: 'div', props: { className: 'text-xs text-gray-400', children: `x${item.quantity}` } },
            {
              type: 'button',
              props: {
                className: 'text-xs bg-blue-600 px-2 py-1 rounded mt-2',
                onClick: () => onUseItem(item.itemId),
                children: '使用',
              }
            },
          ],
        },
      };
    },
  };
}

// ===============================
// Daily Reward Widget
// ===============================

function DailyRewardWidget() {
  const stats = $lotteryStats;
  const canClaim = $canFreeDraw;
  
  return {
    remainingDraws: stats.freeRemaining,
    canClaim,
    
    claimReward: () => {
      if (!canClaim) return null;
      
      const result = lottery.freeDraw();
      return result;
    },
    
    timeUntilNext: canClaim ? 0 : calculateTimeUntilNextClaim(),
  };
}

function calculateTimeUntilNextClaim(): number {
  // 24小时冷却
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const lastClaim = lottery.lastFreeDrawTime;
  const now = Date.now();
  
  if (lastClaim === 0) return 0;
  
  const elapsed = now - lastClaim;
  return Math.max(0, COOLDOWN_MS - elapsed);
}

// ===============================
// Pity Counter Display
// ===============================

function PityDisplay() {
  const stats = $lotteryStats;
  
  return {
    mythicProgress: {
      current: stats.pityMythic,
      max: 500,
      percent: (stats.pityMythic / 500) * 100,
    },
    legendaryProgress: {
      current: stats.pityLegendary,
      max: 100,
      percent: (stats.pityLegendary / 100) * 100,
    },
    
    mythicLabel: stats.pityMythic >= 500 ? '🌟 必中神话!' : `🌟 ${500 - stats.pityMythic}次保底`,
    legendaryLabel: stats.pityLegendary >= 100 ? '👑 必中传说!' : `👑 ${100 - stats.pityLegendary}次保底`,
  };
}

// ===============================
// Gacha Page Layout
// ===============================

/*
function GachaPage() {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [lastResult, setLastResult] = useState<typeof LOOT_TABLE.mythic[0] | null>(null);
  
  const stats = $lotteryStats;
  const canClaim = $canFreeDraw;
  const pityDisplay = PityDisplay();
  
  const handleOpen = (boxType: string) => {
    if (animating) return;
    
    const boxInfo = getBoxInfo(boxType);
    if (usdc.balance < boxInfo.price) {
      alert('USDC不足!');
      return;
    }
    
    // 扣除USDC
    usdc.withdraw(boxInfo.price);
    
    // 开始动画
    setAnimating(true);
    setSelectedBox(boxType);
    
    // 抽奖
    const { result } = lottery.paidDraw(boxType as any);
    if (result) {
      setLastResult(result.item);
    }
    
    // 动画结束后显示结果
    setTimeout(() => {
      setAnimating(false);
    }, 3000);
  };
  
  return (
    <div className="gacha-page">
      <h1>🎰 抽奖中心</h1>
      
      {/* 免费抽奖 */}
      <DailyRewardWidget />
      
      {/* 保底显示 */}
      <PityDisplay />
      
      {/* 盲盒列表 */}
      <div className="box-grid">
        {['common', 'rare', 'epic', 'legendary', 'mythic'].map(type => (
          <LootBoxCard 
            key={type}
            boxType={type as any}
            onOpen={handleOpen}
          />
        ))}
      </div>
      
      {/* 动画/结果 */}
      {animating && lastResult && (
        <GachaAnimation item={lastResult} isNew={true} onComplete={() => {}} />
      )}
      
      {/* 背包 */}
      <InventoryDisplay />
    </div>
  );
}
*/

// ===============================
// Export
// ===============================

export default {
  lottery,
  lotteryStats,
  canFreeDraw,
  getBoxInfo,
  formatRarity,
  LootBoxCard,
  GachaAnimation,
  InventoryDisplay,
  DailyRewardWidget,
  PityDisplay,
};
