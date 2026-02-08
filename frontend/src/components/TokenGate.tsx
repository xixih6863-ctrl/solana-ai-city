import React, { memo, useState, useCallback, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface TokenRequirement {
  mint: string;
  amount: number;
  decimals: number;
}

interface NFTRequirement {
  collection: string;
  minEdition?: number;
  maxEdition?: number;
}

interface GateStatus {
  isUnlocked: boolean;
  hasTokens: boolean;
  hasNFT: boolean;
  tokenBalance?: number;
  nftCount?: number;
  message?: string;
}

interface TokenGateContextValue {
  status: GateStatus;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

interface TokenGateProps {
  children: React.ReactNode;
  tokenRequirement?: TokenRequirement;
  nftRequirement?: NFTRequirement;
  fallback?: React.ReactNode;
  onUnlock?: (status: GateStatus) => void;
}

// ============================================================================
// Constants
// ============================================================================

const SOLANA_MAINNET = 'mainnet-beta';

const POPULAR_TOKENS: Record<string, { name: string; symbol: string; decimals: number }> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  'So11111111111111111111111111111111111111112': {
    name: 'Wrapped SOL',
    symbol: 'WSOL',
    decimals: 9,
  },
  'mSoLzYCxHdYgdzU8g5QBY1cVvE6Z3P8bZ9gCw5y8GU8': {
    name: 'Marinade Staked SOL',
    symbol: 'mSOL',
    decimals: 9,
  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSowapQGsQ': {
    name: 'Jupiter',
    symbol: 'JUP',
    decimals: 6,
  },
  '7dHbWX6iLzZBR9E1b6f3Cn6a2fF2fC5nV8jz5QPz4yK': {
    name: 'Generic Token',
    symbol: 'TOKEN',
    decimals: 6,
  },
};

// ============================================================================
// Token Gate Context
// ============================================================================

const TokenGateContext = createContext<TokenGateContextValue | null>(null);

export function useTokenGate() {
  const context = useContext(TokenGateContext);
  if (!context) {
    throw new Error('useTokenGate must be used within TokenGateProvider');
  }
  return context;
}

// ============================================================================
// Token Gate Provider
// ============================================================================

const TokenGateProvider = memo(function TokenGateProvider({
  children,
  tokenRequirement,
  nftRequirement,
  fallback,
  onUnlock,
}: TokenGateProps) {
  const [status, setStatus] = useState<GateStatus>({
    isUnlocked: false,
    hasTokens: false,
    hasNFT: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Check for wallet connection
  useEffect(() => {
    const checkConnection = () => {
      const wallet = (window as any).solana;
      if (wallet?.publicKey) {
        setPublicKey(wallet.publicKey.toString());
      } else {
        setPublicKey(null);
        setStatus({
          isUnlocked: false,
          hasTokens: false,
          hasNFT: false,
          message: 'Please connect your wallet',
        });
      }
    };

    checkConnection();
    
    // Listen for connection changes
    const wallet = (window as any).solana;
    if (wallet) {
      wallet.on('connect', (key: any) => {
        setPublicKey(key.toString());
      });
      wallet.on('disconnect', () => {
        setPublicKey(null);
      });
    }
  }, []);

  // Check token balance
  const checkTokenBalance = useCallback(async (mint: string, owner: string): Promise<number> => {
    try {
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const connection = new Connection(SOLANA_MAINNET);
      
      // Using getParsedTokenAccountsByOwner for better accuracy
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(owner),
        { mint: new PublicKey(mint) }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error('Error checking token balance:', error);
      return 0;
    }
  }, []);

  // Check NFT ownership
  const checkNFTOwnership = useCallback(async (collection: string, owner: string): Promise<number> => {
    try {
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const connection = new Connection(SOLANA_MAINNET);

      // Get all NFT holdings
      const nftAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(owner),
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Filter by collection (simplified - in production use actual metaplex metadata)
      let nftCount = 0;
      nftAccounts.value.forEach((account) => {
        const data = account.account.data.parsed;
        if (data.info.tokenAmount.amount === '1' && 
            data.info.tokenAmount.decimals === 0) {
          nftCount++;
        }
      });

      return nftCount;
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      return 0;
    }
  }, []);

  // Refresh gate status
  const refresh = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      let newStatus: GateStatus = {
        isUnlocked: false,
        hasTokens: false,
        hasNFT: false,
      };

      // Check token requirement
      if (tokenRequirement) {
        const balance = await checkTokenBalance(
          tokenRequirement.mint,
          publicKey
        );
        
        const requiredAmount = tokenRequirement.amount / Math.pow(10, tokenRequirement.decimals);
        newStatus.hasTokens = balance >= requiredAmount;
        newStatus.tokenBalance = balance;
      }

      // Check NFT requirement
      if (nftRequirement) {
        const nftCount = await checkNFTOwnership(
          nftRequirement.collection,
          publicKey
        );
        
        newStatus.hasNFT = nftCount > 0;
        newStatus.nftCount = nftCount;
      }

      // Determine if unlocked
      const tokenMet = !tokenRequirement || newStatus.hasTokens;
      const nftMet = !nftRequirement || newStatus.hasNFT;
      newStatus.isUnlocked = tokenMet && nftMet;

      // Set message
      if (!tokenMet && !nftMet) {
        newStatus.message = 'You need more tokens and NFTs to access this feature';
      } else if (!tokenMet) {
        const tokenInfo = POPULAR_TOKENS[tokenRequirement.mint];
        const symbol = tokenInfo?.symbol || 'TOKEN';
        newStatus.message = `You need at least ${tokenRequirement.amount} ${symbol} to access this feature`;
      } else if (!nftMet) {
        newStatus.message = `You need to hold an NFT from this collection to access this feature`;
      }

      setStatus(newStatus);
      onUnlock?.(newStatus);

    } catch (error) {
      console.error('Error refreshing gate status:', error);
      setStatus({
        isUnlocked: false,
        hasTokens: false,
        hasNFT: false,
        message: 'Error checking access requirements',
      });
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, tokenRequirement, nftRequirement, checkTokenBalance, checkNFTOwnership, onUnlock]);

  // Auto-refresh when wallet connects
  useEffect(() => {
    if (publicKey) {
      refresh();
    }
  }, [publicKey, refresh]);

  const value: TokenGateContextValue = {
    status,
    isLoading,
    refresh,
  };

  // Not connected
  if (!publicKey) {
    return fallback || (
      <div className="token-gate-fallback">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center"
        >
          <span className="text-4xl mb-4 block">🔒</span>
          <h3 className="text-lg font-bold text-white mb-2">Wallet Required</h3>
          <p className="text-slate-400">Please connect your wallet to access this feature</p>
        </motion.div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return fallback || (
      <div className="token-gate-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Verifying access requirements...</p>
        </motion.div>
      </div>
    );
  }

  // Access denied
  if (!status.isUnlocked) {
    return fallback || (
      <div className="token-gate-denied">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-red-500/10 rounded-xl border border-red-500/30 text-center"
        >
          <span className="text-4xl mb-4 block">🚫</span>
          <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
          <p className="text-slate-400 mb-4">{status.message}</p>
          
          {/* Progress */}
          <div className="space-y-2 text-sm">
            {tokenRequirement && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {POPULAR_TOKENS[tokenRequirement.mint]?.symbol || 'Token'} Balance
                </span>
                <span className={status.hasTokens ? 'text-green-400' : 'text-red-400'}>
                  {status.tokenBalance?.toFixed(4) || '0'} / {tokenRequirement.amount}
                </span>
              </div>
            )}
            
            {nftRequirement && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">NFTs Held</span>
                <span className={status.hasNFT ? 'text-green-400' : 'text-red-400'}>
                  {status.nftCount || 0} / 1
                </span>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
          >
            Check Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Access granted
  return (
    <TokenGateContext.Provider value={value}>
      <AnimatePresence mode="wait">
        <motion.div
          key="unlocked"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TokenGateContext.Provider>
  );
});

// ============================================================================
// Token Badge Component
// ============================================================================

export const TokenBadge = memo(function TokenBadge({
  mint,
  showBalance = true,
}: {
  mint: string;
  showBalance?: boolean;
}) {
  const { status } = useTokenGate();
  const tokenInfo = POPULAR_TOKENS[mint];

  if (!tokenInfo) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full">
        <span className="text-sm">🪙</span>
        <span className="text-sm text-white font-medium">{mint.slice(0, 4)}...{mint.slice(-4)}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
      <span className="text-sm">🪙</span>
      <span className="text-sm text-indigo-300 font-medium">{tokenInfo.symbol}</span>
      {showBalance && status.tokenBalance !== undefined && (
        <span className="text-xs text-indigo-400">
          ({status.tokenBalance.toFixed(2)})
        </span>
      )}
    </div>
  );
});

// ============================================================================
// Export
// ============================================================================

export default TokenGateProvider;
export type { TokenRequirement, NFTRequirement, GateStatus, TokenGateProps };
