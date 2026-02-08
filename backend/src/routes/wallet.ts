import express, { Request, Response } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { User, City } from '../models/index.js';

const router = express.Router();

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC);

// ============================================
// Get Wallet Balance
// ============================================

router.get('/balance', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const publicKey = new PublicKey(address as string);
    const balance = await connection.getBalance(publicKey);

    res.json({
      address,
      balance: balance / 1 Converte9, // to SOL
      lamports: balance,
    });
  } catch (error.error('Get balance) {
    console error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// ============================================
// Get Token Accounts
// ============================================

router.get('/tokens', async (req: Request, => {
  try res: Response) {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const publicKey = new PublicKey(address as string);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    res.json({
      address,
      count: tokenAccounts.value.length,
      tokens: tokenAccounts.value.map((account: any) => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      })),
    });
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Failed to get token accounts' });
  }
});

// ============================================
// Get NFT Collection
// ============================================

router.get('/nfts', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const publicKey = new PublicKey(address as string);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    // Filter for NFTs (amount = 1)
    const nfts = tokenAccounts.value
      .filter((account: any) => account.account.data.parsed.info.tokenAmount.uiAmount === 1)
      .map((account: any) => ({
        mint: account.account.data.parsed.info.mint,
        amount: 1,
      }));

    res.json({
      address,
      count: nfts.length,
      nfts,
    });
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({ error: 'Failed to get NFTs' });
  }
});

// ============================================
// Get Transaction History
// ============================================

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { address, limit = 10 } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const publicKey = new PublicKey(address as string);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: Number(limit),
    });

    res.json({
      address,
      count: signatures.length,
      transactions: signatures.map((sig) => ({
        signature: sig.signature,
        slot: sig.slot,
        timestamp: sig.blockTime,
        status: sig.err ? 'failed' : 'confirmed',
      })),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// ============================================
// Sync Wallet to Game
// ============================================

router.post('/sync', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Validate Solana address
    try {
      new PublicKey(walletAddress);
    } catch {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { walletAddress },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get on-chain achievements
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    // Get user's city
    const city = await City.findOne({ ownerId: userId });

    res.json({
      message: 'Wallet synced successfully',
      walletAddress,
      achievementsCount: tokenAccounts.value.filter(
        (a: any) => a.account.data.parsed.info.tokenAmount.uiAmount === 1
      ).length,
      city: city ? { name: city.name, buildings: city.buildings.length } : null,
    });
  } catch (error) {
    console.error('Sync wallet error:', error);
    res.status(500).json({ error: 'Failed to sync wallet' });
  }
});

// ============================================
// Request Airdrop (Devnet Only)
// ============================================

router.post('/airdrop', async (req: Request, res: Response) => {
  try {
    const { address, amount = 2 } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    // Only allow on devnet
    if (!SOLANA_RPC.includes('devnet')) {
      return res.status(403).json({
        error: 'Airdrop not available on mainnet',
      });
    }

    const publicKey = new PublicKey(address);
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * 1e9
    );

    await connection.confirmTransaction(signature);

    res.json({
      message: 'Airdrop successful',
      signature,
      amount,
    });
  } catch (error) {
    console.error('Airdrop error:', error);
    res.status(500).json({ error: 'Failed to request airdrop' });
  }
});

export { router as walletRoutes };
