import { Wallet } from "../wallet";
import {
  Connection,
  sendAndConfirmRawTransaction,
  Transaction,
  BlockhashWithExpiryBlockHeight,
} from "@solana/web3.js";
import base58 from "bs58";

/**
 * Utility function that sequentially sends and confirm already signed transactions.
 *
 * @param wallet
 * @param connection
 * @param transactions
 * @param recentBlockhash
 * @returns the signatures of each transaction
 */
export async function sendTransactions(
  wallet: Wallet,
  connection: Connection,
  transactions: Transaction[],
  recentBlockhash: BlockhashWithExpiryBlockHeight
): Promise<string[]> {
  const signedTxs = await wallet.signAllTransactions(transactions);

  const signatures: string[] = [];
  for (const signed of signedTxs) {
    const rawTransaction = signed.serialize();
    const signature = await sendAndConfirmRawTransaction(
      connection,
      rawTransaction,
      {
        signature: base58.encode(signed.signature!),
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      },
      {
        commitment: "confirmed",
      }
    );

    signatures.push(signature);
  }

  return signatures;
}
