import { PublicKey } from "@solana/web3.js";

import { Transaction } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";

/**
 * There are no generic interface for all wallets so I grabbed
 * the basic methods from a couple of wallets here
 * https://github.com/solana-labs/wallet-adapter/
 * Can be extended with more methods from there
 *  */
export interface Wallet {
  publicKey: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
/**
 * Wallet class for testing purposes with only a limited
 * amount of methods.
 */
export class TestWallet implements Wallet {
  private keypair: Keypair;
  constructor(keypair?: Keypair) {
    const walletKeypair = keypair || Keypair.generate();
    this.keypair = walletKeypair;
  }
  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.keypair);

    return tx;
  }
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.keypair);
      return t;
    });
  }
  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }
}
