import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import crypto from 'crypto';

// Initialize connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

// ============================================
// Solana Pay Service
// ============================================

export interface SolanaPayConfig {
  merchantId: string;
  merchantName: string;
  reference: PublicKey;
}

export interface TransferRequest {
  from: PublicKey;
  to: PublicKey;
  amount: number; // in lamports
  splToken?: PublicKey;
  reference?: PublicKey;
  memo?: string;
}

export interface PaymentRequest {
  recipient: string;
  amount: number; // in SOL or tokens
  label: string;
  message: string;
  memo?: string;
  reference?: string;
  splToken?: string;
}

export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  amount: number;
  timestamp: number;
}

// ============================================
// Create Payment Request URL
// ============================================

export function createPaymentURL(request: PaymentRequest): string {
  const params = new URLSearchParams({
    recipient: request.recipient,
    amount: request.amount.toString(),
    label: request.label,
    message: request.message,
  });

  if (request.memo) {
    params.append('memo', request.memo);
  }

  if (request.reference) {
    params.append('reference', request.reference);
  }

  if (request.splToken) {
    params.append('splToken', request.splToken);
  }

  return `solana:${request.recipient}?${params.toString()}`;
}

// ============================================
// Parse Payment Request
// ============================================

export function parsePaymentURL(url: string): PaymentRequest | null {
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== 'solana:') {
      return null;
    }

    const recipient = parsed.hostname;
    const params = new URLSearchParams(parsed.search);

    return {
      recipient,
      amount: parseFloat(params.get('amount') || '0'),
      label: params.get('label') || '',
      message: params.get('message') || '',
      memo: params.get('memo') || undefined,
      reference: params.get('reference') || undefined,
      splToken: params.get('splToken') || undefined,
    };
  } catch (error) {
    console.error('Parse payment URL error:', error);
    return null;
  }
}

// ============================================
// Create Transfer Transaction
// ============================================

export async function createTransferTransaction(
  request: TransferRequest
): Promise<Transaction> {
  try {
    const transaction = new Transaction();
    transaction.feePayer = request.from;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    if (request.splToken) {
      // SPL Token transfer
      const fromTokenAccount = await getAssociatedTokenAddress(
        request.splToken,
        request.from
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        request.splToken,
        request.to
      );

      // Check if recipient token account exists
      const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);

      if (!toTokenAccountInfo) {
        // Create recipient token account
        transaction.add(
          createAssociatedTokenAccountInstruction(
            request.from,
            toTokenAccount,
            request.to,
            request.splToken
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          request.from,
          request.amount // Must be integer for SPL tokens
        )
      );
    } else {
      // SOL transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: request.from,
          toPubkey: request.to,
          lamports: request.amount,
        })
      );
    }

    // Add reference if provided
    if (request.reference) {
      transaction.add({
        keys: [],
        programId: request.reference,
        data: Buffer.from([]),
      });
    }

    // Add memo if provided
    if (request.memo) {
      transaction.add({
        keys: [],
        programId: new PublicKey('MemoSq4gqABAXKb96abH8eLLptjz6Pz6XNX2YaMVoquT'),
        data: Buffer.from(request.memo),
      });
    }

    return transaction;
  } catch (error) {
    console.error('Create transfer transaction error:', error);
    throw new Error('Failed to create transfer transaction');
  }
}

// ============================================
// Verify Payment
// ============================================

export async function verifyPayment(
  reference: PublicKey,
  expectedAmount: number
): Promise<PaymentStatus> {
  try {
    // Get signature for reference
    const signatures = await connection.getSignaturesForAddress(reference);
    
    if (signatures.length === 0) {
      return {
        reference: reference.toString(),
        status: 'pending',
        amount: expectedAmount,
        timestamp: Date.now(),
      };
    }

    const latestSignature = signatures[0];
    
    // Verify the transaction
    const transaction = await connection.getParsedTransaction(latestSignature.signature);
    
    if (!transaction) {
      return {
        reference: reference.toString(),
        status: 'pending',
        amount: expectedAmount,
        timestamp: Date.now(),
      };
    }

    // Check if transaction is confirmed
    const meta = transaction.meta;
    if (!meta || meta.err) {
      return {
        reference: reference.toString(),
        status: 'failed',
        signature: latestSignature.signature,
        amount: expectedAmount,
        timestamp: latestSignature.blockTime ? latestSignature.blockTime * 1000 : Date.now(),
      };
    }

    // Calculate actual transfer amount
    let actualAmount = 0;
    if (transaction.transaction.message.instructions.length > 0) {
      const instruction = transaction.transaction.message.instructions[0];
      if ('parsed' in instruction) {
        // SOL transfer
        const parsed = instruction.parsed;
        if (parsed.type === 'transfer') {
          actualAmount = parsed.info.lamports;
        }
      }
    }

    return {
      reference: reference.toString(),
      status: latestSignature.confirmationStatus === 'confirmed' || 
              latestSignature.confirmationStatus === 'finalized'
        ? 'confirmed'
        : 'pending',
      signature: latestSignature.signature,
      amount: actualAmount || expectedAmount,
      timestamp: latestSignature.blockTime ? latestSignature.blockTime * 1000 : Date.now(),
    };
  } catch (error) {
    console.error('Verify payment error:', error);
    throw new Error('Failed to verify payment');
  }
}

// ============================================
// Generate Payment QR Code
// ============================================

export function generatePaymentQRCode(request: PaymentRequest): string {
  const url = createPaymentURL(request);
  
  // Return URL for QR code generation
  // In production, use a library like 'qrcode' to generate the actual QR code
  return url;
}

// ============================================
// Create Merchant Account
// ============================================

export async function createMerchantAccount(
  merchantKey: Keypair,
  merchantId: string
): Promise<{ publicKey: PublicKey }> {
  try {
    // In production, this would create a real merchant account
    // For now, return the public key
    return {
      publicKey: merchantKey.publicKey,
    };
  } catch (error) {
    console.error('Create merchant account error:', error);
    throw new Error('Failed to create merchant account');
  }
}

// ============================================
// Get Merchant Balance
// ============================================

export async function getMerchantBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert to SOL
  } catch (error) {
    console.error('Get merchant balance error:', error);
    throw new Error('Failed to get merchant balance');
  }
}

// ============================================
// Withdraw to Treasury
// ============================================

export async function withdrawToTreasury(
  fromKey: Keypair,
  treasuryKey: PublicKey,
  amount: number
): Promise<string> {
  try {
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromKey.publicKey,
        toPubkey: treasuryKey,
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );

    const signature = await connection.sendTransaction(transaction, [fromKey]);
    return signature;
  } catch (error) {
    console.error('Withdraw to treasury error:', error);
    throw new Error('Failed to withdraw to treasury');
  }
}

// ============================================
// Get Transaction History
// ============================================

export async function getTransactionHistory(
  publicKey: PublicKey,
  limit: number = 10
): Promise<PaymentStatus[]> {
  try {
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    
    return signatures.map((sig) => ({
      reference: sig.signature,
      status: sig.confirmationStatus === 'confirmed' || 
              sig.confirmationStatus === 'finalized'
        ? 'confirmed'
        : 'pending',
      signature: sig.signature,
      amount: 0, // Would need to parse each transaction
      timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
    }));
  } catch (error) {
    console.error('Get transaction history error:', error);
    throw new Error('Failed to get transaction history');
  }
}

// ============================================
// Generate Reference Keypair
// ============================================

export function generateReferenceKeypair(): Keypair {
  return Keypair.generate();
}

// ============================================
// Crypto Hash for Verification
// ============================================

export function generatePaymentHash(
  recipient: string,
  amount: number,
  reference: string,
  timestamp: number
): string {
  const data = `${recipient}:${amount}:${reference}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyPaymentHash(
  recipient: string,
  amount: number,
  reference: string,
  timestamp: number,
  expectedHash: string
): boolean {
  const computedHash = generatePaymentHash(recipient, amount, reference, timestamp);
  return computedHash === expectedHash;
}

export default {
  createPaymentURL,
  parsePaymentURL,
  createTransferTransaction,
  verifyPayment,
  generatePaymentQRCode,
  createMerchantAccount,
  getMerchantBalance,
  withdrawToTreasury,
  getTransactionHistory,
  generateReferenceKeypair,
  generatePaymentHash,
  verifyPaymentHash,
};
