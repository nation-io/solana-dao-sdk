import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TestWallet } from "../wallet";

export async function createWallet(
  connection: Connection,
  initialBalance: number = LAMPORTS_PER_SOL / 10
): Promise<TestWallet> {
  const keypair = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    keypair.publicKey,
    initialBalance
  );

  const recentBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: airdropSignature,
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
  });

  return new TestWallet(keypair);
}

export function randomId() {
  return Math.random().toString(36).slice(2, 10);
}
