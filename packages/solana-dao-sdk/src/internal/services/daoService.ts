import {
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
  BlockhashWithExpiryBlockHeight,
} from "@solana/web3.js";
import base58 from "bs58";

import { Wallet } from "../../wallet";
import { TokenRepository } from "../repositories/tokenRepository";
import { DaoRepository } from "../repositories/daoRepository";
import { sendTransactions } from "../sender";

const communityMintDecimals = 6;
const tokenAmount = 1;

export type MultiSigDaoResponse = {
  daoPk: PublicKey;
  communityMintPk: PublicKey;
  councilMintPk: PublicKey;
  signatures: string[];
};

export class DaoService {
  connection: Connection;
  wallet: Wallet | null;
  tokenRepository: TokenRepository;
  daoRepository: DaoRepository;

  constructor(connection: Connection, wallet: Wallet | null) {
    this.connection = connection;
    this.wallet = wallet;
    this.tokenRepository = new TokenRepository(this.connection, wallet);
    this.daoRepository = new DaoRepository(this.connection, wallet);
  }

  public setWallet(wallet: Wallet) {
    this.wallet = wallet;
    this.tokenRepository.setWallet(wallet);
    this.daoRepository.setWallet(wallet);
  }

  public async createMultisigDao(
    councilWalletsPks: PublicKey[],
    name: string,
    yesVoteThreshold: number
  ): Promise<MultiSigDaoResponse> {
    try {
      if (!this.wallet) {
        throw new Error("There is no wallet available");
      }

      const walletPk = this.wallet.publicKey;
      const recentBlockhash = await this.connection.getLatestBlockhash();

      const {
        communityMintPk,
        councilMintPk,
        transaction: mintTransaction,
      } = await this.createMintsForDao(walletPk, recentBlockhash);

      const { walletAtaPk, transaction: membersTransaction } =
        await this.mintCouncilTokensToMembers(
          walletPk,
          councilWalletsPks,
          councilMintPk,
          recentBlockhash
        );

      const { daoPk, transaction: daoTransaction } =
        await this.createConfiguredDao(
          name,
          yesVoteThreshold,
          walletPk,
          communityMintPk,
          councilMintPk,
          walletAtaPk,
          recentBlockhash
        );

      const transactions = [
        mintTransaction,
        membersTransaction,
        daoTransaction,
      ];

      const signatures = await sendTransactions(
        this.wallet,
        this.connection,
        transactions,
        recentBlockhash
      );

      return {
        daoPk,
        communityMintPk: communityMintPk,
        councilMintPk: councilMintPk,
        signatures,
      };
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }

  private async mintCouncilTokensToMembers(
    walletPk: PublicKey,
    councilWalletsPks: PublicKey[],
    councilMintPk: PublicKey,
    recentBlockhash: BlockhashWithExpiryBlockHeight
  ): Promise<{
    transaction: Transaction;
    walletAtaPk: PublicKey;
  }> {
    const instructions: TransactionInstruction[] = [];
    let walletAtaPk: PublicKey | undefined;
    if (!this.wallet) {
      throw new Error("There is no wallet available");
    }

    for (const teamWalletPk of councilWalletsPks) {
      const associatedTokenAccount =
        await this.tokenRepository.createAssociatedTokenAccount(
          councilMintPk,
          teamWalletPk,
          walletPk
        );

      const mint = await this.tokenRepository.mintTo(
        councilMintPk,
        associatedTokenAccount.publicKey,
        walletPk,
        tokenAmount
      );

      instructions.push(
        ...associatedTokenAccount.instructions,
        ...mint.instructions
      );

      if (teamWalletPk.equals(walletPk)) {
        walletAtaPk = associatedTokenAccount.publicKey;
      }
    }
    if (!walletAtaPk) {
      throw new Error("Current wallet must be in the team");
    }

    const transaction = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    instructions.forEach((instruction) => transaction.add(instruction));

    return { transaction, walletAtaPk };
  }

  private async createMintsForDao(
    walletPk: PublicKey,
    recentBlockhash: BlockhashWithExpiryBlockHeight
  ): Promise<{
    transaction: Transaction;
    communityMintPk: PublicKey;
    councilMintPk: PublicKey;
  }> {
    if (!this.wallet) {
      throw new Error("There is no wallet available");
    }

    const communityMint = await this.tokenRepository.createMint(
      walletPk,
      null,
      communityMintDecimals,
      walletPk
    );

    const councilMint = await this.tokenRepository.createMint(
      walletPk,
      null,
      0,
      walletPk
    );

    const transaction = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    communityMint.instructions.forEach((instruction) =>
      transaction.add(instruction)
    );

    councilMint.instructions.forEach((instruction) =>
      transaction.add(instruction)
    );

    if (communityMint.signers.length > 0) {
      transaction.partialSign(...communityMint.signers);
    }

    if (councilMint.signers.length > 0) {
      transaction.partialSign(...councilMint.signers);
    }

    return {
      transaction,
      communityMintPk: communityMint.publicKey,
      councilMintPk: councilMint.publicKey,
    };
  }

  private async createConfiguredDao(
    name: string,
    yesVoteThreshold: number,
    walletPk: PublicKey,
    communityMintPk: PublicKey,
    councilMintPk: PublicKey,
    walletAtaPk: PublicKey,
    recentBlockhash: BlockhashWithExpiryBlockHeight
  ): Promise<{ daoPk: PublicKey; transaction: Transaction }> {
    if (!this.wallet) {
      throw new Error("There is no wallet available");
    }

    const { daoPk, instructions } = await this.daoRepository.createDao(
      name,
      yesVoteThreshold,
      walletPk,
      communityMintPk,
      councilMintPk,
      walletAtaPk
    );

    const transaction = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    instructions.forEach((instruction) => transaction.add(instruction));

    return { daoPk, transaction };
  }
}
