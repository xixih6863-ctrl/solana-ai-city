/**
 * Format utilities for Solana AI City
 */

/**
 * Format SOL amount
 */
export function formatSOL(
  amount: number,
  decimals: number = 2
): string {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} SOL`;
}

/**
 * Format USD currency
 */
export function formatUSD(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Format large numbers with abbreviations
 */
export function formatCompact(
  num: number,
  decimals: number = 1
): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toString();
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number,
  decimals: number = 2
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format time duration
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }
  return `${diffYears}y ago`;
}

/**
 * Format a date
 */
export function formatDate(
  date: Date | number,
  format: 'short' | 'long' | 'iso' = 'short'
): string {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'iso':
      return d.toISOString();
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format wallet address (truncate middle)
 */
export function formatAddress(
  address: string,
  chars: number = 4
): string {
  if (!address || address.length <= chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format transaction signature
 */
export function formatSignature(signature: string, chars: number = 8): string {
  return formatAddress(signature, chars);
}

/**
 * Format bytes to human readable
 */
export function formatBytes(
  bytes: number,
  decimals: number = 2
): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format game resources
 */
export interface GameResourcesFormatted {
  gold: string;
  energy: string;
  points: string;
  population?: string;
}

export function formatResources(
  resources: {
    gold: number;
    energy: number;
    points: number;
    population?: number;
  }
): GameResourcesFormatted {
  return {
    gold: formatCompact(resources.gold),
    energy: `${resources.energy}`,
    points: formatCompact(resources.points),
    population: resources.population
      ? formatCompact(resources.population)
      : undefined,
  };
}

/**
 * Format achievement rarity
 */
export function formatRarity(rarity: string): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Format rank with ordinal
 */
export function formatRank(rank: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  return `${rank}${suffix}`;
}

/**
 * Format level
 */
export function formatLevel(level: number): string {
  return `Lv. ${level}`;
}

/**
 * Format percentage with color class
 */
export function getPercentageColor(
  value: number
): 'success' | 'warning' | 'danger' {
  if (value >= 70) return 'success';
  if (value >= 30) return 'warning';
  return 'danger';
}

/**
 * Format rate (e.g., "+10/s")
 */
export function formatRate(
  value: number,
  perSecond: boolean = true
): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCompact(value)}/${perSecond ? 's' : 'm'}`;
}

/**
 * Calculate ROI percentage
 */
export function calculateROI(
  cost: number,
  returnAmount: number,
  timeframe: number // in days
): number {
  const dailyReturn = returnAmount / timeframe;
  const roi = (dailyReturn / cost) * 100;
  return roi;
}

/**
 * Format ROI with label
 */
export function formatROI(roi: number): string {
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI`;
}

/**
 * Format multiplier
 */
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(1)}x`;
}

/**
 * Get time until target date
 */
export function getTimeUntil(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Ended';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(text: string): string {
  const result = text.replace(/([A-Z])/g, ' $1');
  return capitalize(result.trim());
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
  const result = text.split('_').map(capitalize).join(' ');
  return result;
}

/**
 * Format number with emoji
 */
export function formatWithEmoji(
  value: number,
  thresholds: { value: number; emoji: string }[]
): string {
  const found = [...thresholds].reverse().find((t) => value >= t.value);
  return found ? `${found.emoji} ${formatCompact(value)}` : formatCompact(value);
}
