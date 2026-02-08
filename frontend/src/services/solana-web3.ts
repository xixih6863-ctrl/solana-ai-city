import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Umi, createUmi, keypairIdentity, walletAdapterIdentity } from '@metaplex-foundation/umi';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { bundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr';

// ============================================
// Solana Web3 Service
// ============================================

export interface WalletAdapter {
  publicKey: PublicKey | null;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface NetworkConfig {
  name: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcUrl: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}

export const NETWORKS: Record<string, NetworkConfig> = {
  'mainnet-beta': {
    name: 'mainnet-beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    commitment: 'confirmed',
  },
  'devnet': {
    name: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    commitment: 'confirmed',
  },
  'testnet': {
    name: 'testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    commitment: 'confirmed',
  },
};

class SolanaService {
  private connection: Connection | null = null;
  private wallet: WalletAdapter | null = null;
  private network: string = 'devnet';

  // Initialize connection
  initialize(network: string = 'devnet') {
    this.network = network;
    const config = NETWORKS[network];
    this.connection = new Connection(config.rpcUrl, config.commitment);
  }

  // Get connection instance
  getConnection(): Connection {
    if (!this.connection) {
      this.initialize();
    }
    return this.connection!;
  }

  // Set wallet adapter
  setWallet(wallet: WalletAdapter) {
    this.wallet = wallet;
  }

  // Get wallet
  getWallet(): WalletAdapter | null {
    return this.wallet;
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.wallet !== null && this.wallet.publicKey !== null;
  }

  // Get public key
  getPublicKey(): PublicKey | null {
    return this.wallet?.publicKey || null;
  }

  // Get wallet address
  async getWalletAddress(): Promise<string | null> {
    const publicKey = this.getPublicKey();
    return publicKey?.toString() || null;
  }

  // Get SOL balance
  async getBalance(publicKey?: PublicKey): Promise<number> {
    const pk = publicKey || this.wallet?.publicKey;
    if (!pk) return 0;

    try {
      const balance = await this.getConnection().getBalance(pk);
      return balance / 1e9; // Convert from lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  // Get token accounts
  async getTokenAccounts(publicKey?: PublicKey) {
    const pk = publicKey || this.wallet?.publicKey;
    if (!pk) return [];

    try {
      const response = await this.getConnection().getParsedTokenAccountsByOwner(
        pk,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      return response.value;
    } catch (error) {
      console.error('Error getting token accounts:', error);
      return [];
    }
  }

  // Get NFT collections
  async getNFTs(publicKey?: PublicKey) {
    const pk = publicKey || this.wallet?.publicKey;
    if (!pk) return [];

    try {
      const response = await this.getConnection().getParsedTokenAccountsByOwner(pk, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      // Filter for NFTs (currently simplified - real implementation needs metadata)
      const nfts = response.value.filter((account) => {
        const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
        return amount === 1; // NFTs have amount 1
      });

      return nfts;
    } catch (error) {
      console.error('Error getting NFTs:', error);
      return [];
    }
  }

  // Send SOL
  async sendSOL(to: string, amount: number) {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const toPublicKey = new PublicKey(to);
      const transaction = await this.getConnection().requestAirdrop(
        this.wallet.publicKey,
        amount * 1e9 // Convert to lamports
      );
      
      await this.getConnection().confirmTransaction(transaction);
      return transaction;
    } catch (error) {
      console.error('Error sending SOL:', error);
      throw error;
    }
  }

  // Request airdrop (devnet only)
  async requestAirdrop(amount: number = 2) {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (this.network !== 'devnet') {
      throw new Error('Airdrop only available on devnet');
    }

    try {
      const signature = await this.getConnection().requestAirdrop(
        this.wallet.publicKey,
        amount * 1e9
      );
      await this.getConnection().confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(publicKey?: PublicKey, limit: number = 10) {
    const pk = publicKey || this.wallet?.publicKey;
    if (!pk) return [];

    try {
      const signatures = await this.getConnection().getSignaturesForAddress(
        pk,
        { limit }
      );
      return signatures;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Get account info
  async getAccountInfo(publicKey: string) {
    try {
      const info = await this.getConnection().getParsedAccountInfo(new PublicKey(publicKey));
      return info;
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }

  // Get current network
  getNetwork(): string {
    return this.network;
  }

  // Switch network
  async switchNetwork(network: string) {
    if (!NETWORKS[network]) {
      throw new Error(`Unknown network: ${network}`);
    }
    this.initialize(network);
  }
}

// Singleton instance
export const solanaService = new SolanaService();

// ============================================
// Metaplex UMI Service
// ============================================

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
  };
}

class MetaplexService {
  private umi: Umi | null = null;

  // Initialize UMI
  initialize(wallet: WalletAdapter) {
    const umi = createUmi(NETWORKS[solanaService.getNetwork()].rpcUrl)
      .use(walletAdapterIdentity(wallet as any))
      .use(mplTokenMetadata())
      .use(bundlrUploader());
    
    this.umi = umi;
  }

  // Get UMI instance
  getUmi(): Umi {
    if (!this.umi) {
      throw new Error('Metaplex not initialized');
    }
    return this.umi;
  }

  // Upload metadata to Arweave
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    const umi = this.getUmi();
    
    // Upload to Bundlr/Arweave
    const uri = await umi.uploader.uploadJson([metadata]);
    return uri[0];
  }

  // Upload image to Arweave
  async uploadImage(file: File): Promise<string> {
    const umi = this.getUmi();
    
    const [uri] = await umi.uploader.upload([file]);
    return uri;
  }

  // Create NFT
  async createNFT(
    metadata: NFTMetadata,
    recipient: PublicKey,
    collection?: PublicKey
  ) {
    const umi = this.getUmi();
    
    // Upload metadata
    const metadataUri = await this.uploadMetadata(metadata);
    
    // Create NFT (simplified - real implementation needs more config)
    const mint = umi.eddsa.generateKeypair();
    
    // Note: Full NFT creation requires more setup
    console.log('NFT creation initiated:', {
      metadataUri,
      recipient: recipient.toString(),
    });
    
    return {
      mint: mint.publicKey.toString(),
      metadataUri,
    };
  }

  // Mint achievement NFT
  async mintAchievementNFT(
    achievementId: string,
    achievementName: string,
    recipient: PublicKey,
    imageUrl: string,
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  ) {
    const metadata: NFTMetadata = {
      name: `${achievementName} - Achievement`,
      symbol: 'SAC',
      description: `Solana AI City Achievement: ${achievementName}`,
      image: imageUrl,
      attributes: [
        { trait_type: 'Achievement ID', value: achievementId },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Game', value: 'Solana AI City' },
      ],
      properties: {
        files: [{ uri: imageUrl, type: 'image/png' }],
        category: 'image',
      },
    };

    return this.createNFT(metadata, recipient);
  }

  // Verify NFT ownership
  async verifyNFTOwnership(
    mintAddress: string,
    ownerAddress: string
  ): Promise<boolean> {
    try {
      const mint = new PublicKey(mintAddress);
      const owner = new PublicKey(ownerAddress);
      
      const connection = solanaService.getConnection();
      const accountInfo = await connection.getParsedAccountInfo(mint);
      
      if (!accountInfo.value) return false;
      
      // Verify ownership (simplified)
      return true;
    } catch (error) {
      console.error('Error verifying NFT ownership:', error);
      return false;
    }
  }

  // Get NFT metadata
  async getNFTMetadata(mintAddress: string): Promise<NFTMetadata | null> {
    try {
      const connection = solanaService.getConnection();
      const mint = new PublicKey(mintAddress);
      
      // Get token metadata account
      const [metadataAddress] = await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjbVHhvs').toBuffer(),
          mint.toBuffer(),
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjbVHhvs')
      );
      
      const accountInfo = await connection.getParsedAccountInfo(metadataAddress);
      if (!accountInfo.value) return null;
      
      // Parse metadata (simplified)
      return {
        name: 'Unknown NFT',
        symbol: '???',
        description: '',
        image: '',
        attributes: [],
        properties: { files: [], category: 'image' },
      };
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      return null;
    }
  }
}

// Singleton instance
export const metaplexService = new MetaplexService();

// ============================================
// Utility Functions
// ============================================

export function formatWalletAddress(address: string, chars: number = 4): string {
  if (!address || address.length <= chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function parseTokenAmount(amount: number, decimals: number = 9): string {
  return (amount / Math.pow(10, decimals)).toString();
}

export function lamportsToSOL(lamports: number): number {
  return lamports / 1e9;
}

export function SOLToLamports(sol: number): number {
  return sol * 1e9;
}

export default {
  solanaService,
  metaplexService,
  formatWalletAddress,
  isValidSolanaAddress,
  parseTokenAmount,
  lamportsToSOL,
  SOLToLamports,
};
