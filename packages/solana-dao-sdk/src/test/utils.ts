import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TestWallet } from "..";

export async function createWallet(
  connection: Connection,
  initialBalance: number = LAMPORTS_PER_SOL
): Promise<TestWallet> {
  const keypair = Keypair.generate();

  let airdropSignature = await connection.requestAirdrop(
    keypair.publicKey,
    initialBalance
  );

  const recentBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: airdropSignature,
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
  });

  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`Wallet created with: ${balance} LAMPORTS`);

  const wallet = new TestWallet(keypair);

  return wallet;
}
