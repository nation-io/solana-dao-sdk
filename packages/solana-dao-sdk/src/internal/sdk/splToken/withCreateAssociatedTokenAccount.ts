import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export async function createAssociatedTokenAccount(
  mintPk: PublicKey,
  ownerPk: PublicKey,
  payerPk: PublicKey
) {
  const instructions: TransactionInstruction[] = [];

  const ataPk = await getAssociatedTokenAddress(
    mintPk,
    ownerPk, // owner
    false, // TODO: check this.
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  instructions.push(
    createAssociatedTokenAccountInstruction(
      payerPk,
      ataPk,
      ownerPk,
      mintPk,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  return { publicKey: ataPk, instructions };
}
