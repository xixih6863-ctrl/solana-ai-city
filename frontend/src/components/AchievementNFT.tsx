import React, { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mintedAt?: string;
  metadataURI?: string;
}

interface NFTMintStatus {
  isMinting: boolean;
  signature?: string;
  error?: string;
  success?: boolean;
}

interface AchievementNFTProps {
  achievement: Achievement;
  recipientAddress: string;
  onMint?: (signature: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const METADATA_TEMPLATE = {
  name: '',
  description: '',
  image: '',
  attributes: [
    { trait_type: 'Rarity', value: '' },
    { trait_type: 'Achievement', value: '' },
    { trait_type: 'Game', value: 'Solana AI City' },
  ],
  properties: {
    files: [{ uri: '', type: 'image/png' }],
    category: 'image',
  },
};

const RARITY_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  common: { bg: 'bg-slate-700', border: 'border-slate-500', glow: 'shadow-slate-500/20', text: 'text-slate-300' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-400', glow: 'shadow-blue-500/20', text: 'text-blue-300' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-400', glow: 'shadow-purple-500/20', text: 'text-purple-300' },
  legendary: { bg: 'bg-yellow-500/20', border: 'border-yellow-400', glow: 'shadow-yellow-500/20', text: 'text-yellow-300' },
};

// ============================================================================
// Achievement NFT Component
// ============================================================================

const AchievementNFT = memo(function AchievementNFT({
  achievement,
  recipientAddress,
  onMint,
  onError,
}: AchievementNFTProps) {
  const [status, setStatus] = useState<NFTMintStatus>({ isMinting: false });
  const [mintedNFTs, setMintedNFTs] = useState<Achievement[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Generate metadata URI (in production, upload to Arweave or similar)
  const generateMetadata = useCallback((ach: Achievement) => {
    const metadata = {
      ...METADATA_TEMPLATE,
      name: `${ach.name} - Solana AI City Achievement`,
      description: ach.description,
      image: `arweave://placeholder/${ach.id}`, // Would be actual image URL
      attributes: [
        { trait_type: 'Rarity', value: ach.rarity },
        { trait_type: 'Achievement', value: ach.name },
        { trait_type: 'Game', value: 'Solana AI City' },
        { trait_type: 'Minted At', value: new Date().toISOString() },
      ],
    };
    return JSON.stringify(metadata);
  }, []);

  // Mint NFT (simplified - in production use actual Metaplex SDK)
  const mintNFT = useCallback(async () => {
    if (!recipientAddress) {
      setStatus({ isMinting: false, error: 'Wallet not connected' });
      onError?.('Wallet not connected');
      return;
    }

    setStatus({ isMinting: true, error: undefined });

    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would:
      // 1. Upload metadata to Arweave
      // 2. Create metadata account
      // 3. Mint NFT to recipient
      // 4. Return signature

      const mockSignature = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const mintedAchievement: Achievement = {
        ...achievement,
        mintedAt: new Date().toISOString(),
        metadataURI: `arweave://placeholder/${achievement.id}`,
      };

      setStatus({ isMinting: false, signature: mockSignature, success: true });
      setMintedNFTs(prev => [...prev, mintedAchievement]);
      onMint?.(mockSignature);

    } catch (error: any) {
      setStatus({ isMinting: false, error: error.message || 'Minting failed' });
      onError?.(error.message || 'Minting failed');
    }
  }, [achievement, recipientAddress, onMint, onError]);

  // Check if already minted
  useEffect(() => {
    const isMinted = mintedNFTs.some(nft => nft.id === achievement.id);
    if (isMinted) {
      setStatus({ success: true, signature: 'already-minted' });
    }
  }, [achievement.id, mintedNFTs]);

  const rarity = RARITY_COLORS[achievement.rarity];
  const isMinted = status.success || mintedNFTs.some(nft => nft.id === achievement.id);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-4 rounded-xl border-2 overflow-hidden
        ${rarity.bg} ${rarity.border} ${rarity.glow}
      `}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${rarity.text} ${rarity.bg}`}>
        {achievement.rarity.toUpperCase()}
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center mb-4">
        <motion.div
          animate={isMinted ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-4xl"
        >
          {achievement.icon}
        </motion.div>
      </div>

      {/* Name */}
      <h3 className={`text-lg font-bold ${rarity.text} mb-2`}>
        {achievement.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4">
        {achievement.description}
      </p>

      {/* Status */}
      <div className="mb-4">
        {isMinted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-400"
          >
            <span className="text-lg">✅</span>
            <span className="text-sm font-medium">NFT Minted!</span>
          </motion.div>
        ) : (
          <div className="text-sm text-slate-400">
            Complete the achievement to mint your NFT
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Preview Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPreview(true)}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
        >
          👁️ Preview
        </motion.button>

        {/* Mint Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={mintNFT}
          disabled={isMinted || status.isMinting || !recipientAddress}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium
            ${isMinted 
              ? 'bg-green-600 text-white cursor-default'
              : status.isMinting
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }
          `}
        >
          {status.isMinting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Minting...
            </span>
          ) : isMinted ? (
            'Minted ✅'
          ) : (
            '🪙 Mint NFT'
          )}
        </motion.button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {status.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
          >
            {status.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm mx-4 p-6 bg-slate-900 rounded-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* NFT Preview Card */}
              <div className={`
                relative p-6 rounded-xl border-2 text-center
                ${rarity.bg} ${rarity.border}
              `}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-xl ${rarity.glow} opacity-50 blur-xl`} />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center text-6xl">
                    {achievement.icon}
                  </div>

                  {/* Rarity */}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${rarity.text} ${rarity.bg}`}>
                    {achievement.rarity.toUpperCase()}
                  </div>

                  {/* Name */}
                  <h3 className={`text-2xl font-bold ${rarity.text} mt-3 mb-2`}>
                    {achievement.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-300 mb-4">
                    {achievement.description}
                  </p>

                  {/* Game Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">
                    <span>🎮</span>
                    <span>Solana AI City</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPreview(false)}
                className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
              >
                Close Preview
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ============================================================================
// NFT Collection Grid
// ============================================================================

export const NFTCollection = memo(function NFTCollection({
  achievements,
  recipientAddress,
}: {
  achievements: Achievement[];
  recipientAddress: string;
}) {
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'date'>('rarity');

  const filteredAchievements = achievements
    .filter(ach => filter === 'all' || ach.rarity === filter)
    .sort((a, b) => {
      if (sortBy === 'rarity') {
        const order = { legendary: 0, epic: 1, rare: 2, common: 3 };
        return order[a.rarity] - order[b.rarity];
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="nft-collection">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
          <motion.button
            key={rarity}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(rarity)}
            className={`
              px-4 py-2 rounded-lg font-medium capitalize transition-colors
              ${filter === rarity
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }
            `}
          >
            {rarity}
          </motion.button>
        ))}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="ml-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="rarity">Sort by Rarity</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementNFT
            key={achievement.id}
            achievement={achievement}
            recipientAddress={recipientAddress}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <span className="text-4xl mb-4 block">🎮</span>
          <p>No achievements found</p>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// Export
// ============================================================================

export default AchievementNFT;
export type { Achievement, NFTMintStatus, AchievementNFTProps };
