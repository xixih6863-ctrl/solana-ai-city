/**
 * Solana AI City - Resource Panel Component
 * 资源面板组件
 */

import { energy, energyPercentage, energyTimeToFull, formatEnergyTime } from './energy';
import { gold, goldFormatted, goldPercentage, canAffordGold } from './gold';
import { usdc, usdcFormatted, totalValueFormatted, canAffordUSDC } from './usdc';
import { reputation, reputationProgress, reputationBonus } from './reputation';

// Resource icons
export const RESOURCE_ICONS = {
  energy: '⚡',
  gold: '🪙',
  usdc: '💎',
  reputation: '🏆',
};

// Resource colors
export const RESOURCE_COLORS = {
  energy: 'from-yellow-400 to-orange-500',
  gold: 'from-yellow-600 to-yellow-400',
  usdc: 'from-blue-400 to-blue-600',
  reputation: 'from-purple-400 to-pink-500',
};

// Format helpers
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

// ===============================
// Resource Panel Component
// ===============================

/*
// Usage in React/TSX:
import { ResourcePanel, EnergyDisplay, GoldDisplay, USDCDisplay, ReputationDisplay } from './ResourcePanel';

function GameUI() {
  return (
    <div className="resource-panel">
      <EnergyDisplay showDetails />
      <GoldDisplay />
      <USDCDisplay showStaking />
      <ReputationDisplay showProgress />
    </div>
  );
}
*/

// ===============================
// Energy Display
// ===============================

export function EnergyDisplay({ showDetails = false }: { showDetails?: boolean }) {
  return {
    // Energy value
    value: energy.current,
    // Progress percentage
    percent: $energyPercentage,
    // Time until full
    timeToFull: formatEnergyTime($energyTimeToFull),
    // Can perform action
    canAfford: (cost: number) => energy.current >= cost,
    // Consume energy
    consume: (cost: number) => energy.consume(cost),
    // Buy energy
    buyPack: (type: 'small' | 'medium' | 'large' | 'mega') => energy.buyPack(type),
  };
}

// ===============================
// Gold Display
// ===============================

export function GoldDisplay() {
  return {
    value: $gold.current,
    formatted: $goldFormatted,
    percent: $goldPercentage,
    canAfford: (amount: number) => $gold.current >= amount,
    add: (amount: number) => gold.add(amount),
    spend: (amount: number) => gold.spend(amount),
  };
}

// ===============================
// USDC Display
// ===============================

export function USDCDisplay({ showStaking = false }: { showStaking?: boolean }) {
  return {
    balance: $usdc.balance,
    formatted: $usdcFormatted,
    totalValue: $totalValueFormatted,
    staked: $usdc.staked,
    stakingRewards: $usdc.stakingRewards,
    canAfford: (amount: number) => $usdc.balance >= amount,
    deposit: (amount: number) => usdc.deposit(amount),
    withdraw: (amount: number) => usdc.withdraw(amount),
    stake: (amount: number) => usdc.stake(amount),
    unstake: (amount: number) => usdc.unstake(amount),
    claimRewards: () => usdc.claimStakingRewards(),
  };
}

// ===============================
// Reputation Display
// ===============================

export function ReputationDisplay({ showProgress = false }: { showProgress?: boolean }) {
  return {
    level: $reputation.level,
    title: $reputation.title,
    current: $reputation.current,
    nextLevel: $reputationProgress.next,
    percent: $reputationProgress.percent,
    bonus: $reputationBonus,
    canAccess: (requiredLevel: number) => $reputation.level >= requiredLevel,
    add: (amount: number) => reputation.add(amount),
  };
}

// ===============================
// Resource Manager
// ===============================

export class ResourceManager {
  // Check if can afford all resources
  static canAfford(resources: { energy?: number; gold?: number; usdc?: number }): boolean {
    let can = true;
    if (resources.energy !== undefined) {
      can = can && energy.current >= resources.energy;
    }
    if (resources.gold !== undefined) {
      can = can && $gold.current >= resources.gold;
    }
    if (resources.usdc !== undefined) {
      can = can && $usdc.balance >= resources.usdc;
    }
    return can;
  }
  
  // Consume all resources
  static consume(resources: { energy?: number; gold?: number; usdc?: number }): boolean {
    if (!this.canAfford(resources)) {
      return false;
    }
    
    if (resources.energy !== undefined) {
      energy.consume(resources.energy);
    }
    if (resources.gold !== undefined) {
      gold.spend(resources.gold);
    }
    if (resources.usdc !== undefined) {
      usdc.withdraw(resources.usdc);
    }
    
    return true;
  }
  
  // Add all resources
  static add(resources: { energy?: number; gold?: number; usdc?: number }) {
    if (resources.energy !== undefined) {
      energy.regen(resources.energy);
    }
    if (resources.gold !== undefined) {
      gold.add(resources.gold);
    }
    if (resources.usdc !== undefined) {
      usdc.deposit(resources.usdc);
    }
  }
  
  // Get total value (in USDC)
  static getTotalValue(): number {
    const goldValue = $gold.current / 1000; // 1000 gold = 1 USDC
    return $usdc.balance + goldValue;
  }
}

// ===============================
// Export
// ===============================

export default {
  energy,
  gold,
  usdc,
  reputation,
  RESOURCE_ICONS,
  RESOURCE_COLORS,
  ResourceManager,
  EnergyDisplay,
  GoldDisplay,
  USDCDisplay,
  ReputationDisplay,
};
