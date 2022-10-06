import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Wallet } from "../../wallet";
import { TOKEN_PROGRAM_ID } from "../tokens";

export class TokenRepository {
  connection: Connection;
  wallet: Wallet | null;

  constructor(connection: Connection, wallet: Wallet | null) {
    this.connection = connection;
    this.wallet = wallet;
  }

  public setWallet(wallet: Wallet) {
    this.wallet = wallet;
  }

  public async createAssociatedTokenAccount(
    mintPk: PublicKey,
    ownerPk: PublicKey,
    payerPk: PublicKey
  ) {
    const instructions: TransactionInstruction[] = [];

    const ataPk = await getAssociatedTokenAddress(
      mintPk,
      ownerPk,
      false,
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

  public async createMint(
    ownerPk: PublicKey,
    freezeAuthorityPk: PublicKey | null,
    decimals: number,
    payerPk: PublicKey
  ) {
    const mintRentExempt =
      await this.connection.getMinimumBalanceForRentExemption(MintLayout.span);

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

  public async mintTo(
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
}
