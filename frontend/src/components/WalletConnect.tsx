import React, { memo, useState, useCallback, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  walletType: 'phantom' | 'solflare' | 'backpack' | 'glow' | null;
}

interface WalletContextValue {
  state: WalletState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: string) => Promise<any>;
  isConnecting: boolean;
  error: string | null;
}

interface WalletConnectProps {
  children: React.ReactNode;
  onConnect?: (state: WalletState) => void;
  onDisconnect?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const SOLANA_MAINNET = 'mainnet-beta';
const SOLANA_DEVNET = 'devnet';

const WALLET_ADAPTERS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    url: 'https://phantom.app',
    installed: false,
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    url: 'https://solflare.com',
    installed: false,
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: '🎒',
    url: 'https://backpack.app',
    installed: false,
  },
  {
    id: 'glow',
    name: 'Glow',
    icon: '✨',
    url: 'https://glowwallet.com',
    installed: false,
  },
];

// ============================================================================
// Wallet Context
// ============================================================================

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

// ============================================================================
// Wallet Provider
// ============================================================================

const WalletProvider = memo(function WalletProvider({
  children,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    walletType: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for installed wallets
  useEffect(() => {
    const checkWallets = () => {
      const updatedAdapters = WALLET_ADAPTERS.map(adapter => ({
        ...adapter,
        installed: typeof window !== 'undefined' && 
          (window as any).solana?.isPhantom === true && adapter.id === 'phantom' ||
          (window as any)?.solflare?.isSolflare === true && adapter.id === 'solflare' ||
          (window as any)?.backpack?.solana?.isBackpack === true && adapter.id === 'backpack' ||
          (window as any)?.glowWallet !== undefined && adapter.id === 'glow'
      }));
      return updatedAdapters;
    };

    const adapters = checkWallets();
    
    // Update global adapters for display
    if (typeof window !== 'undefined') {
      (window as any).walletAdapters = adapters;
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Try to find any installed wallet
      let wallet: any = null;
      
      // Try Phantom
      if ((window as any).solana?.isPhantom) {
        wallet = (window as any).solana;
      }
      // Try Solflare
      else if ((window as any).solflare?.isSolflare) {
        wallet = (window as any).solflare;
      }
      // Try Backpack
      else if ((window as any).backpack?.solana?.isBackpack) {
        wallet = (window as any).backpack.solana;
      }
      // Try Glow
      else if ((window as any).glowWallet) {
        wallet = (window as any).glowWallet;
      }

      if (!wallet) {
        throw new Error('No wallet found. Please install Phantom, Solflare, or another Solana wallet.');
      }

      // Connect
      const response = await wallet.connect();
      
      const publicKey = response.publicKey?.toString() || wallet.publicKey?.toString();
      
      // Get balance
      let balance = 0;
      try {
        const connection = new (await import('@solana/web3.js')).Connection(SOLANA_MAINNET);
        const balanceLamports = await connection.getBalance(wallet.publicKey);
        balance = balanceLamports / 1e9;
      } catch (e) {
        console.warn('Could not fetch balance:', e);
      }

      // Determine wallet type
      let walletType: WalletState['walletType'] = null;
      if ((window as any).solana?.isPhantom) walletType = 'phantom';
      else if ((window as any).solflare?.isSolflare) walletType = 'solflare';
      else if ((window as any).backpack?.solana?.isBackpack) walletType = 'backpack';
      else if ((window as any).glowWallet) walletType = 'glow';

      const newState: WalletState = {
        connected: true,
        publicKey,
        balance,
        walletType,
      };

      setState(newState);
      onConnect?.(newState);

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [onConnect]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      const wallet = (window as any).solana;
      if (wallet?.disconnect) {
        await wallet.disconnect();
      }

      const newState: WalletState = {
        connected: false,
        publicKey: null,
        balance: 0,
        walletType: null,
      };

      setState(newState);
      onDisconnect?.();

    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, [onDisconnect]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction: any) => {
    const wallet = (window as any).solana;
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const { signature } = await wallet.sendTransaction(transaction, new (await import('@solana/web3.js')).Connection(SOLANA_MAINNET));
      return { signature };
    } catch (err: any) {
      throw new Error(err.message || 'Transaction failed');
    }
  }, []);

  // Sign message
  const signMessage = useCallback(async (message: string) => {
    const wallet = (window as any).solana;
    if (!wallet?.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    try {
      const signed = await wallet.signMessage(Buffer.from(message));
      return signed;
    } catch (err: any) {
      throw new Error(err.message || 'Signing failed');
    }
  }, []);

  const value: WalletContextValue = {
    state,
    connect,
    disconnect,
    sendTransaction,
    signMessage,
    isConnecting,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
});

// ============================================================================
// Wallet Button Component
// ============================================================================

export const WalletButton = memo(function WalletButton({
  variant = 'primary',
  size = 'md',
  showBalance = true,
  showAddress = true,
}: {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showBalance?: boolean;
  showAddress?: boolean;
}) {
  const { state, connect, disconnect, isConnecting, error } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return balance >= 0.01 ? `${balance.toFixed(4)} SOL` : '0 SOL';
  };

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <div className="wallet-button-container">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {state.connected ? (
        <div className="flex items-center gap-3">
          {/* Balance */}
          {showBalance && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
              <span className="text-yellow-400">◎</span>
              <span className="text-white font-medium">
                {formatBalance(state.balance)}
              </span>
            </div>
          )}

          {/* Address */}
          {showAddress && state.publicKey && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
              <span className="text-2xl">
                {state.walletType === 'phantom' ? '👻' :
                 state.walletType === 'solflare' ? '🔥' :
                 state.walletType === 'backpack' ? '🎒' :
                 state.walletType === 'glow' ? '✨' : '💼'}
              </span>
              <span className="text-slate-300 font-mono">
                {formatAddress(state.publicKey)}
              </span>
            </div>
          )}

          {/* Disconnect Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={disconnect}
            className={`${variants.secondary} ${sizes.sm} rounded-lg font-medium transition-colors`}
          >
            Disconnect
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connect}
          disabled={isConnecting}
          className={`
            ${variants[variant]}
            ${sizes[size]}
            rounded-lg font-medium
            transition-colors
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex items-center gap-2
          `}
        >
          {isConnecting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="text-xl">👻</span>
              <span>Connect Wallet</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
});

// ============================================================================
// Wallet Modal Component
// ============================================================================

export const WalletModal = memo(function WalletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { connect, isConnecting, error } = useWallet();
  const [detectedWallets, setDetectedWallets] = useState(WALLET_ADAPTERS);

  useEffect(() => {
    if (isOpen) {
      // Refresh detected wallets
      const checkWallets = () => {
        const updated = WALLET_ADAPTERS.map(adapter => ({
          ...adapter,
          installed: typeof window !== 'undefined' && 
            ((window as any).solana?.isPhantom && adapter.id === 'phantom') ||
            ((window as any).solflare?.isSolflare && adapter.id === 'solflare')
        }));
        setDetectedWallets(updated);
      };
      checkWallets();
    }
  }, [isOpen]);

  const handleConnect = useCallback(async (adapterId: string) => {
    try {
      await connect();
      onClose();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  }, [connect, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md mx-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            ✕
          </motion.button>
        </div>

        {/* Wallet List */}
        <div className="p-6 space-y-3">
          {detectedWallets.map((wallet) => (
            <motion.button
              key={wallet.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConnect(wallet.id)}
              disabled={!wallet.installed || isConnecting}
              className={`
                w-full flex items-center gap-4 px-4 py-4 rounded-xl
                ${wallet.installed 
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                  : 'bg-slate-800/50 border border-slate-700/50 opacity-50 cursor-not-allowed'
                }
                transition-all
              `}
            >
              <span className="text-3xl">{wallet.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{wallet.name}</div>
                <div className="text-sm text-slate-400">
                  {wallet.installed ? 'Detected' : 'Not installed'}
                </div>
              </div>
              {!wallet.installed && (
                <a
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm text-indigo-400 hover:text-indigo-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  Install →
                </a>
              )}
            </motion.button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-6 mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-sm text-slate-400 text-center">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

// ============================================================================
// Export
// ============================================================================

export default WalletProvider;
export type { WalletState, WalletContextValue, WalletConnectProps };
