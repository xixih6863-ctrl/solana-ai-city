import React, { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface BlockchainAccount {
  publicKey: string;
  lamports: number;
  tokens: TokenAccount[];
  nfts: NFTAccount[];
}

interface TokenAccount {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  valueUSD?: number;
}

interface NFTAccount {
  mint: string;
  name: string;
  collection: string;
  image?: string;
}

interface Transaction {
  signature: string;
  type: 'transfer' | 'swap' | 'mint' | 'burn' | 'other';
  status: 'confirmed' | 'pending' | 'failed';
  amount?: number;
  symbol?: string;
  timestamp: string;
  description: string;
}

interface BlockchainPanelProps {
  publicKey: string;
  onDisconnect?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const SOLANA_EXPLORER = 'https://explorer.solana.com';
const SOLANA_MAINNET = 'mainnet-beta';

// Mock data for demo
const MOCK_TOKENS: TokenAccount[] = [
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin', symbol: 'USDC', balance: 1500.00, decimals: 6, valueUSD: 1500 },
  { mint: 'So11111111111111111111111111111111111111112', name: 'Wrapped SOL', symbol: 'WSOL', balance: 5.5, decimals: 9, valueUSD: 825 },
  { mint: 'mSoLzYCxHdYgdzU8g5QBY1cVvE6Z3P8bZ9gCw5y8GU8', name: 'Marinade Staked SOL', symbol: 'mSOL', balance: 2.1, decimals: 9, valueUSD: 315 },
];

const MOCK_NFTS: NFTAccount[] = [
  { mint: 'NFT1...1234', name: 'Early Adopter Badge', collection: 'Solana AI City', image: '🚀' },
  { mint: 'NFT2...5678', name: 'Champion #42', collection: 'DeFi Champions', image: '🏆' },
  { mint: 'NFT3...9012', name: 'Blue Chip #7', collection: 'Blue Chip Club', image: '💎' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { signature: 'tx1...abc', type: 'swap', status: 'confirmed', amount: 100, symbol: 'USDC', timestamp: '2026-02-07T10:30:00Z', description: 'Swapped 100 USDC for SOL' },
  { signature: 'tx2...def', type: 'transfer', status: 'confirmed', amount: 50, symbol: 'WSOL', timestamp: '2026-02-07T09:15:00Z', description: 'Received 50 WSOL' },
  { signature: 'tx3...ghi', type: 'mint', status: 'confirmed', timestamp: '2026-02-06T18:00:00Z', description: 'Minted achievement NFT' },
  { signature: 'tx4...jkl', type: 'transfer', status: 'pending', amount: 200, symbol: 'USDC', timestamp: '2026-02-07T11:00:00Z', description: 'Sent 200 USDC' },
];

// ============================================================================
// Helper Functions
// ============================================================================

const formatAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const formatAmount = (amount: number, decimals: number = 9) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

const getTotalValue = (tokens: TokenAccount[]) => {
  return tokens.reduce((acc, token) => acc + (token.valueUSD || 0), 0);
};

// ============================================================================
// Blockchain Panel Component
// ============================================================================

const BlockchainPanel = memo(function BlockchainPanel({
  publicKey,
  onDisconnect,
}: BlockchainPanelProps) {
  const [activeTab, setActiveTab] = useState<'assets' | 'history' | 'achievements'>('assets');
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [nfts, setNfts] = useState<NFTAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  // Fetch account data
  const fetchAccountData = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, this would fetch from Solana
      setTokens(MOCK_TOKENS);
      setNfts(MOCK_NFTS);
      setTransactions(MOCK_TRANSACTIONS);
      setTotalValue(getTotalValue(MOCK_TOKENS));

    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const tabs = [
    { id: 'assets', label: 'Assets', icon: '💰' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'achievements', label: 'NFTs', icon: '🏅' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">🔗 Blockchain</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full"
            />
          </motion.button>
        </div>

        {/* Public Key */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg">
          <span className="text-sm text-slate-400">Address</span>
          <code className="flex-1 text-sm text-indigo-400 font-mono truncate">
            {formatAddress(publicKey)}
          </code>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigator.clipboard.writeText(publicKey)}
            className="text-slate-400 hover:text-white"
            title="Copy address"
          >
            📋
          </motion.button>
          <a
            href={`${SOLANA_EXPLORER}/address/${publicKey}?cluster=${SOLANA_MAINNET}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white"
            title="View on Explorer"
          >
            🔗
          </a>
        </div>

        {/* Total Value */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-400">Total Value</span>
          <span className="text-xl font-bold text-white">
            ${formatAmount(totalValue, 2)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -2 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mb-4"
              />
              <p className="text-slate-400">Loading blockchain data...</p>
            </motion.div>
          ) : (
            <>
              {activeTab === 'assets' && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {tokens.map((token) => (
                    <TokenRow key={token.mint} token={token} />
                  ))}

                  {tokens.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <span className="text-3xl mb-2 block">💰</span>
                      <p>No tokens found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {transactions.map((tx) => (
                    <TransactionRow key={tx.signature} transaction={tx} />
                  ))}

                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <span className="text-3xl mb-2 block">📋</span>
                      <p>No transactions yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {nfts.map((nft) => (
                    <NFTRow key={nft.mint} nft={nft} />
                  ))}

                  {nfts.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <span className="text-3xl mb-2 block">🏅</span>
                      <p>No NFTs found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/30">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDisconnect}
          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
        >
          Disconnect Wallet
        </motion.button>
      </div>
    </motion.div>
  );
});

// ============================================================================
// Sub-components
// ============================================================================

const TokenRow = memo(function TokenRow({ token }: { token: TokenAccount }) {
  const [showUSD, setShowUSD] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
    >
      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">
        {token.symbol === 'USDC' ? '💵' : token.symbol === 'WSOL' ? '🪙' : '🪙'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{token.name}</span>
          <span className="text-xs text-slate-500">{token.symbol}</span>
        </div>
        <button
          onClick={() => setShowUSD(!showUSD)}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {showUSD 
            ? `$${formatAmount(token.valueUSD || 0, 2)}`
            : `${formatAmount(token.balance, token.decimals)} ${token.symbol}`
          }
        </button>
      </div>

      <div className="text-right">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-sm"
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
});

const TransactionRow = memo(function TransactionRow({ transaction }: { transaction: Transaction }) {
  const icons: Record<string, string> = {
    transfer: '↔️',
    swap: '🔄',
    mint: '🪙',
    burn: '🔥',
    other: '📝',
  };

  const statusColors: Record<string, string> = {
    confirmed: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
    >
      <div className="w-10 h-10 rounded-full bg-slate-600/50 flex items-center justify-center text-lg">
        {icons[transaction.type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{transaction.description}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{formatTimestamp(transaction.timestamp)}</span>
          <span className={`text-xs ${statusColors[transaction.status]}`}>
            • {transaction.status}
          </span>
        </div>
      </div>

      {transaction.amount && (
        <div className={`text-sm font-medium ${transaction.type === 'transfer' && transaction.amount > 0 ? 'text-green-400' : 'text-slate-300'}`}>
          {transaction.amount > 0 ? '+' : ''}{transaction.amount} {transaction.symbol}
        </div>
      )}
    </motion.div>
  );
});

const NFTRow = memo(function NFTRow({ nft }: { nft: NFTAccount }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-2xl">
        {nft.image || '🏅'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate">{nft.name}</div>
        <div className="text-xs text-slate-500">{nft.collection}</div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-sm"
      >
        View
      </motion.button>
    </motion.div>
  );
});

// ============================================================================
// Export
// ============================================================================

export default BlockchainPanel;
export type { BlockchainAccount, TokenAccount, NFTAccount, Transaction, BlockchainPanelProps };
