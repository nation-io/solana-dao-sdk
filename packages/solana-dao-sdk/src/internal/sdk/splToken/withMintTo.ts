import { createMintToInstruction } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "../tokens";

export async function mintTo(
  mintPk: PublicKey,
  destinationPk: PublicKey,
  mintAuthorityPk: PublicKey,
  amount: number | bigint
) {
  const instructions: TransactionInstruction[] = [];

  instructions.push(
    createMintToInstruction(
      mintPk,
      destinationPk,
      mintAuthorityPk,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  return { instructions };
}
