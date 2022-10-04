import { MintLayout, createInitializeMintInstruction } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "../tokens";

export async function createMint(
  connection: Connection,
  ownerPk: PublicKey,
  freezeAuthorityPk: PublicKey | null,
  decimals: number,
  payerPk: PublicKey
) {
  const mintRentExempt = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );

  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  const mintAccount = new Keypair();

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payerPk,
      newAccountPubkey: mintAccount.publicKey,
      lamports: mintRentExempt,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  signers.push(mintAccount);

  instructions.push(
    createInitializeMintInstruction(
      mintAccount.publicKey,
      decimals,
      ownerPk,
      freezeAuthorityPk,
      TOKEN_PROGRAM_ID
    )
  );

  return {
    publicKey: mintAccount.publicKey,
    instructions,
    signers,
  };
}
