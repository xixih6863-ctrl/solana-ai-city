/**
 * Solana AI City - Resource Index
 * 资源系统统一导出
 */

// Energy System
export * from './energy';

// Gold System
export * from './gold';

// USDC System
export * from './usdc';

// Reputation System
export * from './reputation';

// ===============================
// Combined Resource Panel Component
// ===============================

/*
import { energy, gold, usdc, reputation, reputationProgress, usdcFormatted } from './services/resources';

function ResourcePanel() {
  return (
    <div class="resource-panel">
      <div class="energy">
        ⚡ {energy.current} / {energy.max}
        <ProgressBar value={energy.current / energy.max * 100} />
      </div>
      
      <div class="gold">
        🪙 {gold.current.toLocaleString()}
      </div>
      
      <div class="usdc">
        💎 {usdcFormatted}
      </div>
      
      <div class="reputation">
        🏆 Lv.{reputation.level} {reputation.title}
        <ProgressBar value={reputationProgress.percent} />
      </div>
    </div>
  );
}
*/
