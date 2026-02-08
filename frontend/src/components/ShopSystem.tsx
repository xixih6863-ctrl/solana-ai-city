import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatUSD, formatCompact } from '../utils/format';

// ============================================
// Shop / Store System
// ============================================

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'building' | 'skin' | 'avatar' | 'consumable' | 'subscription' | 'bundle';
  price: {
    type: 'sol' | 'usdc' | 'gold' | 'premium';
    amount: number;
  };
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  limited?: {
    available: number;
    total: number;
    endsAt?: Date;
  };
  featured?: boolean;
  discount?: {
    type: 'percentage' | 'flat';
    value: number;
    endsAt: Date;
  };
  stats?: {
    goldBonus?: number;
    energyBonus?: number;
    speedBonus?: number;
    xpBonus?: number;
  };
  requirements?: {
    level?: number;
    achievements?: string[];
  };
  owned?: boolean;
  quantity?: number;
}

export interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  items: ShopItem[];
}

interface ShopPanelProps {
  categories: ShopCategory[];
  userBalance: {
    sol: number;
    usdc: number;
    gold: number;
    premium: number;
  };
  onPurchase: (itemId: string, quantity: number) => Promise<void>;
  onSelectItem: (item: ShopItem) => void;
  onClose: () => void;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({
  categories,
  userBalance,
  onPurchase,
  onSelectItem,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'buildings');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'featured' | 'sale'>('all');

  const currentCategory = categories.find((c) => c.id === activeCategory);

  const getFilteredItems = () => {
    let items = currentCategory?.items || [];
    if (filter === 'featured') {
      items = items.filter((i) => i.featured);
    } else if (filter === 'sale') {
      items = items.filter((i) => i.discount);
    }
    return items.filter((i) => !i.owned || i.type === 'consumable');
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);
    try {
      await onPurchase(selectedItem.id, quantity);
      setQuantity(1);
    } finally {
      setPurchasing(false);
    }
  };

  const canAfford = (item: ShopItem) => {
    switch (item.price.type) {
      case 'sol':
        return userBalance.sol >= item.price.amount * quantity;
      case 'usdc':
        return userBalance.usdc >= item.price.amount * quantity;
      case 'gold':
        return userBalance.gold >= item.price.amount * quantity;
      case 'premium':
        return userBalance.premium >= item.price.amount * quantity;
      default:
        return false;
    }
  };

  return (
    <div className="shop-panel">
      {/* Header */}
      <div className="shop-header">
        <h2>🛒 Shop</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Balance Display */}
      <div className="shop-balance">
        <div className="balance-item">
          <span className="icon">💰</span>
          <span className="amount">{formatCompact(userBalance.gold)}</span>
        </div>
        <div className="balance-item">
          <span className="icon">◎</span>
          <span className="amount">{userBalance.sol.toFixed(2)}</span>
        </div>
        <div className="balance-item">
          <span className="icon">💳</span>
          <span className="amount">{formatCompact(userBalance.usdc)}</span>
        </div>
        <div className="balance-item premium">
          <span className="icon">💎</span>
          <span className="amount">{userBalance.premium}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="shop-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="shop-filters">
        {(['all', 'featured', 'sale'] as const).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' && '🏪 All'}
            {f === 'featured' && '⭐ Featured'}
            {f === 'sale' && '🔥 Sale'}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="shop-items">
        {getFilteredItems().map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            onClick={() => {
              setSelectedItem(item);
              setQuantity(1);
              onSelectItem(item);
            }}
            canAfford={canAfford(item)}
          />
        ))}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ShopItemModal
            item={selectedItem}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onPurchase={handlePurchase}
            onClose={() => setSelectedItem(null)}
            purchasing={purchasing}
            canAfford={canAfford(selectedItem)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Shop Item Card
const ShopItemCard: React.FC<{
  item: ShopItem;
  onClick: () => void;
  canAfford: boolean;
}> = ({ item, onClick, canAfford }) => {
  const originalPrice = item.discount
    ? item.price.type === 'percentage'
      ? item.price.amount / (1 - item.discount.value / 100)
      : item.price.amount + item.discount.value
    : null;

  return (
    <motion.div
      className={`shop-item-card ${item.featured ? 'featured' : ''} ${!canAfford ? 'expensive' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {item.featured && <div className="featured-badge">⭐ Featured</div>}
      {item.discount && <div className="discount-badge">-{item.discount.value}%</div>}
      
      <div className="item-icon">{item.icon}</div>
      
      {item.rarity && (
        <div className={`item-rarity rarity-${item.rarity}`}>
          {item.rarity}
        </div>
      )}
      
      <div className="item-info">
        <h4>{item.name}</h4>
        <p className="item-type">{item.type}</p>
      </div>
      
      <div className="item-price">
        {originalPrice && (
          <span className="original-price">
            {formatPrice(originalPrice, item.price.type)}
          </span>
        )}
        <span className="current-price">
          {formatPrice(item.price.amount, item.price.type)}
        </span>
      </div>

      {item.limited && (
        <div className="limited-stock">
          <span className="stock-bar">
            <motion.div
              className="stock-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(item.limited.available / item.limited.total) * 100}%` }}
            />
          </span>
          <span className="stock-text">
            {item.limited.available}/{item.limited.total} left
          </span>
        </div>
      )}

      {item.stats && (
        <div className="item-stats">
          {item.stats.goldBonus && <span>+{item.stats.goldBonus} Gold</span>}
          {item.stats.energyBonus && <span>+{item.stats.energyBonus} Energy</span>}
        </div>
      )}
    </motion.div>
  );
};

const formatPrice = (amount: number, type: string) => {
  switch (type) {
    case 'sol':
      return `${amount.toFixed(2)} SOL`;
    case 'usdc':
      return `$${amount.toFixed(2)}`;
    case 'gold':
      return `${formatCompact(amount)} Gold`;
    case 'premium':
      return `${amount} 💎`;
    default:
      return `${amount}`;
  }
};

// Shop Item Modal
const ShopItemModal: React.FC<{
  item: ShopItem;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onPurchase: () => void;
  onClose: () => void;
  purchasing: boolean;
  canAfford: boolean;
}> = ({ item, quantity, onQuantityChange, onPurchase, onClose, purchasing, canAfford }) => {
  const originalTotal = item.discount
    ? item.price.type === 'percentage'
      ? (item.price.amount / (1 - item.discount.value / 100)) * quantity
      : (item.price.amount + item.discount.value) * quantity
    : item.price.amount * quantity;

  const finalTotal = item.price.amount * quantity;
  const savings = originalTotal - finalTotal;

  return (
    <motion.div
      className="shop-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="shop-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-item">
          <div className="modal-icon">{item.icon}</div>
          {item.rarity && (
            <div className={`item-rarity rarity-${item.rarity}`}>
              {item.rarity}
            </div>
          )}
        </div>

        <h2>{item.name}</h2>
        <p className="modal-description">{item.description}</p>

        {item.stats && (
          <div className="modal-stats">
            {item.stats.goldBonus && <div className="stat">💰 +{item.stats.goldBonus} Gold</div>}
            {item.stats.energyBonus && <div className="stat">⚡ +{item.stats.energyBonus} Energy</div>}
            {item.stats.speedBonus && <div className="stat">🚀 +{item.stats.speedBonus}% Speed</div>}
            {item.stats.xpBonus && <div className="stat">✨ +{item.stats.xpBonus}% XP</div>}
          </div>
        )}

        {item.type === 'consumable' && (
          <div className="quantity-selector">
            <span>Quantity:</span>
            <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>-</button>
            <span className="quantity">{quantity}</span>
            <button onClick={() => onQuantityChange(Math.min(99, quantity + 1))}>+</button>
          </div>
        )}

        <div className="modal-price">
          {originalTotal !== finalTotal && (
            <div className="original">Original: {formatPrice(originalTotal, item.price.type)}</div>
          )}
          <div className="final">
            Total: {formatPrice(finalTotal, item.price.type)}
          </div>
          {savings > 0 && (
            <div className="savings">You save {formatPrice(savings, item.price.type)}!</div>
          )}
        </div>

        <button
          className={`purchase-btn ${!canAfford ? 'disabled' : ''}`}
          onClick={onPurchase}
          disabled={!canAfford || purchasing}
        >
          {purchasing ? '⏳ Purchasing...' : !canAfford ? '❌ Cannot Afford' : `💳 Purchase`}
        </button>

        {item.limited && (
          <div className="modal-limited">
            🔥 Only {item.limited.available} left at this price!
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Premium Subscription Tier
export interface SubscriptionTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  bonuses: {
    dailyGold?: number;
    energyBonus?: number;
    xpBonus?: number;
    shopDiscount?: number;
  };
  popular?: boolean;
}

export const SubscriptionCard: React.FC<{
  tier: SubscriptionTier;
  billingPeriod: 'monthly' | 'yearly';
  onSubscribe: (tierId: string) => void;
  isSubscribed?: boolean;
}> = ({ tier, billingPeriod, onSubscribe, isSubscribed }) => {
  const price = billingPeriod === 'monthly' ? tier.price.monthly : tier.price.yearly * 0.8; // 20% off yearly

  return (
    <motion.div className={`subscription-card ${tier.popular ? 'popular' : ''} ${isSubscribed ? 'subscribed' : ''}`}>
      {tier.popular && <div className="popular-badge">Most Popular</div>}
      {isSubscribed && <div className="subscribed-badge">✓ Subscribed</div>}
      
      <h3>{tier.name}</h3>
      <div className="price">
        <span className="amount">${price.toFixed(2)}</span>
        <span className="period">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
      </div>
      
      <ul className="features">
        {tier.features.map((feature, index) => (
          <li key={index}>✓ {feature}</li>
        ))}
      </ul>
      
      {tier.bonuses && (
        <div className="bonuses">
          {tier.bonuses.dailyGold && <span>+{tier.bonuses.dailyGold} Gold/day</span>}
          {tier.bonuses.energyBonus && <span>+{tier.bonuses.energyBonus}% Energy</span>}
          {tier.bonuses.xpBonus && <span>+{tier.bonuses.xpBonus}% XP</span>}
          {tier.bonuses.shopDiscount && <span>{tier.bonuses.shopDiscount}% Off</span>}
        </div>
      )}
      
      <button
        className="subscribe-btn"
        onClick={() => onSubscribe(tier.id)}
        disabled={isSubscribed}
      >
        {isSubscribed ? 'Current Plan' : 'Subscribe'}
      </button>
    </motion.div>
  );
};

// Daily Free Rewards
export const DailyFreeRewards: React.FC<{
  day: number;
  totalDays: number;
  claimed: boolean[];
  onClaim: (day: number) => void;
}> = ({ day, totalDays, claimed, onClaim }) => {
  return (
    <div className="daily-rewards">
      <h3>🎁 Daily Login Rewards</h3>
      <div className="rewards-calendar">
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const isClaimed = claimed[i];
          const isCurrent = dayNum === day;
          const isAvailable = dayNum <= day && !isClaimed;
          
          return (
            <motion.div
              key={i}
              className={`calendar-day ${isClaimed ? 'claimed' : ''} ${isCurrent ? 'current' : ''} ${isAvailable ? 'available' : ''}`}
              onClick={() => isAvailable && onClaim(dayNum)}
              whileHover={isAvailable ? { scale: 1.1 } : undefined}
            >
              <span className="day-number">Day {dayNum}</span>
              <span className="day-icon">
                {isClaimed ? '✓' : isCurrent ? '🎁' : '🔒'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  ShopPanel,
  SubscriptionCard,
  DailyFreeRewards,
};
