/**
 * Solana AI City - Marketplace System
 * 市场交易系统
 */

import { writable, derived } from 'svelte/store';

// ===============================
// Constants
// ===============================

export const MARKET_CONFIG = {
  // 交易费
  SELLER_FEE_PERCENTAGE: 0.025, // 2.5%
  BUYER_FEE_PERCENTAGE: 0,
  
  // 价格范围
  MIN_LISTING_PRICE: 1,      // 最低上架价
  MAX_LISTING_PRICE: 100000, // 最高上架价
  
  // 兑换比例
  GOLD_TO_USDC: 1000, // 1000金币 = 1 USDC
  USDC_TO_GOLD: 800,  // 1 USDC = 800金币 (优惠)
  
  // 拍卖
  AUCTION_DURATION_HOURS: [24, 48, 72, 168], // 可选时长
  AUCTION_EXTENSION_MINUTES: 5, // 最后5分钟延长
  
  // 市场类别
  CATEGORIES: ['NFT', '建筑', '道具', '土地', '资源'],
};

// ===============================
// Types
// ===============================

export type MarketCategory = 'NFT' | '建筑' | '道具' | '土地' | '资源';
export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  item: MarketItem;
  price: number;
  currency: 'USDC' | 'gold';
  status: ListingStatus;
  createdAt: number;
  expiresAt: number;
  views: number;
  favorites: number;
}

export interface MarketItem {
  id: string;
  name: string;
  type: MarketCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  image: string;
  description: string;
  attributes: Record<string, string | number>;
  level?: number;
  power?: number;
}

export interface Auction {
  id: string;
  sellerId: string;
  item: MarketItem;
  startPrice: number;
  currentBid: number;
  highestBidder: string | null;
  bids: AuctionBid[];
  status: 'active' | 'ended' | 'cancelled';
  endTime: number;
  buyNowPrice: number | null;
}

export interface AuctionBid {
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: number;
}

export interface CurrencyExchange {
  goldToUSDC: number;
  usdcToGold: number;
  lastUpdated: number;
}

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
}

export interface Order {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  currency: 'USDC' | 'gold';
  amount: number;
  price: number;
  filled: number;
  createdAt: number;
}

// ===============================
// Market Store
// ===============================

function createMarketStore() {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('solanaCityMarket')
    : null;
  
  const initialState = stored 
    ? JSON.parse(stored)
    : {
        listings: [],
        auctions: [],
        favorites: [],
        myListings: [],
        purchaseHistory: [],
        currencyExchange: {
          goldToUSDC: 1000,
          usdcToGold: 800,
          lastUpdated: Date.now(),
        },
        orderBook: {
          buyOrders: [],
          sellOrders: [],
        },
      };
  
  const { subscribe, set, update } = writable(initialState);
  
  if (typeof localStorage !== 'undefined') {
    subscribe(state => {
      localStorage.setItem('solanaCityMarket', JSON.stringify(state));
    });
  }
  
  return {
    subscribe,
    
    // 上架物品
    createListing: (item: MarketItem, price: number, currency: 'USDC' | 'gold', durationHours: number) => {
      const listing: MarketListing = {
        id: `listing_${Date.now()}`,
        sellerId: 'current_user',
        sellerName: 'You',
        item,
        price,
        currency,
        status: 'active',
        createdAt: Date.now(),
        expiresAt: Date.now() + durationHours * 3600000,
        views: 0,
        favorites: 0,
      };
      
      update(state => ({
        ...state,
        listings: [...state.listings, listing],
        myListings: [...state.myListings, listing.id],
      }));
      
      return listing;
    },
    
    // 购买物品
    purchaseItem: (listingId: string) => {
      let purchase: typeof initialState.purchaseHistory[0] | null = null;
      
      update(state => {
        const listing = state.listings.find(l => l.id === listingId);
        if (!listing || listing.status !== 'active') return state;
        
        const fee = listing.price * MARKET_CONFIG.SELLER_FEE_PERCENTAGE;
        const sellerReceives = listing.price - fee;
        
        // 更新状态
        listing.status = 'sold';
        
        // 添加到购买历史
        purchase = {
          id: `purchase_${Date.now()}`,
          listingId,
          item: listing.item,
          price: listing.price,
          currency: listing.currency,
          purchasedAt: Date.now(),
        };
        
        state.purchaseHistory.unshift(purchase);
        state.purchaseHistory = state.purchaseHistory.slice(0, 100);
        
        return state;
      });
      
      return purchase;
    },
    
    // 取消上架
    cancelListing: (listingId: string) => {
      update(state => {
        const listing = state.listings.find(l => l.id === listingId);
        if (listing && listing.sellerId === 'current_user') {
          listing.status = 'cancelled';
        }
        return state;
      });
    },
    
    // 收藏物品
    toggleFavorite: (listingId: string) => {
      update(state => {
        const idx = state.favorites.indexOf(listingId);
        if (idx === -1) {
          state.favorites.push(listingId);
        } else {
          state.favorites.splice(idx, 1);
        }
        return state;
      });
    },
    
    // 创建拍卖
    createAuction: (item: MarketItem, startPrice: number, durationHours: number, buyNowPrice: number | null) => {
      const auction: Auction = {
        id: `auction_${Date.now()}`,
        sellerId: 'current_user',
        item,
        startPrice,
        currentBid: startPrice,
        highestBidder: null,
        bids: [],
        status: 'active',
        endTime: Date.now() + durationHours * 3600000,
        buyNowPrice,
      };
      
      update(state => ({
        ...state,
        auctions: [...state.auctions, auction],
      }));
      
      return auction;
    },
    
    // 出价
    placeBid: (auctionId: string, amount: number) => {
      let success = false;
      
      update(state => {
        const auction = state.auctions.find(a => a.id === auctionId);
        if (!auction || auction.status !== 'active') return state;
        
        if (amount <= auction.currentBid) return state;
        
        auction.bids.push({
          bidderId: 'current_user',
          bidderName: 'You',
          amount,
          timestamp: Date.now(),
        });
        
        auction.currentBid = amount;
        auction.highestBidder = 'current_user';
        
        return state;
      });
      
      return success;
    },
    
    // 立即购买
    buyNow: (auctionId: string) => {
      let success = false;
      
      update(state => {
        const auction = state.auctions.find(a => a.id === auctionId);
        if (!auction || auction.status !== 'active' || !auction.buyNowPrice) return state;
        
        auction.status = 'ended';
        success = true;
        
        return state;
      });
      
      return success;
    },
    
    // 货币兑换
    exchangeGoldForUSDC: (goldAmount: number) => {
      const usdcAmount = Math.floor(goldAmount / MARKET_CONFIG.GOLD_TO_USDC);
      return usdcAmount;
    },
    
    exchangeUSDCForGold: (usdcAmount: number) => {
      const goldAmount = usdcAmount * MARKET_CONFIG.USDC_TO_GOLD;
      return goldAmount;
    },
    
    // 搜索/筛选
    searchListings: (query: string, category?: MarketCategory, rarity?: string, sortBy?: string) => {
      return {
        query,
        category,
        rarity,
        sortBy,
      };
    },
    
    // 重置
    reset: () => {
      set(initialState);
    },
  };
}

export const market = createMarketStore();

// ===============================
// Derived Stores
// ===============================

export const marketStats = derived(market, $market => {
  const activeListings = $market.listings.filter(l => l.status === 'active');
  const activeAuctions = $market.auctions.filter(a => a.status === 'active');
  const myActiveListings = $market.myListings.filter(id => {
    const listing = $market.listings.find(l => l.id === id);
    return listing && listing.status === 'active';
  });
  
  return {
    totalListings: $market.listings.length,
    activeListings: activeListings.length,
    activeAuctions: activeAuctions.length,
    myActiveListings: myActiveListings.length,
    totalPurchases: $market.purchaseHistory.length,
    favoritesCount: $market.favorites.length,
  };
});

export const exchangeRate = derived(market, $market => $market.currencyExchange);

// ===============================
// Helper Functions
// ===============================

export function formatPrice(price: number, currency: 'USDC' | 'gold'): string {
  if (currency === 'USDC') {
    return `💎 ${price.toLocaleString()}`;
  }
  return `🪙 ${price.toLocaleString()}`;
}

export function calculateFees(price: number, currency: 'USDC' | 'gold'): {
  sellerReceives: number;
  fee: number;
} {
  const fee = Math.floor(price * MARKET_CONFIG.SELLER_FEE_PERCENTAGE);
  return {
    sellerReceives: price - fee,
    fee,
  };
}

export function getTimeRemaining(endTime: number): string {
  const remaining = endTime - Date.now();
  
  if (remaining <= 0) return '已结束';
  
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  
  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ec4899',
  };
  return colors[rarity] || colors.common;
}

// ===============================
// Default Export
// ===============================

export default {
  market,
  marketStats,
  exchangeRate,
  MARKET_CONFIG,
  formatPrice,
  calculateFees,
  getTimeRemaining,
  getRarityColor,
};
