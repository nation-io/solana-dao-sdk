import { Wallet } from '../wallet';
import {
  Connection,
  sendAndConfirmRawTransaction,
  Transaction,
  BlockhashWithExpiryBlockHeight,
} from '@solana/web3.js';
import base58 from 'bs58';

export async function sendTransactions(
  wallet: Wallet,
  connection: Connection,
  transactions: Transaction[],
  recentBlockhash: BlockhashWithExpiryBlockHeight,
): Promise<string[]> {
  const signedTxs = await wallet.signAllTransactions(transactions);

  const transactionsSignatures: string[] = [];
  for (const signed of signedTxs) {
    const rawTransaction = signed.serialize();
    const transactionSignature = await sendAndConfirmRawTransaction(
      connection,
      rawTransaction,
      {
        signature: base58.encode(signed.signature!),
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      },
      {
        commitment: 'confirmed',
      },
    );

    transactionsSignatures.push(transactionSignature);
  }

  return transactionsSignatures;
}
