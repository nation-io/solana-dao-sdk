import {
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import base58 from "bs58";

import { Wallet } from "../../wallet";
import { TokenRepository } from "../repositories/tokenRepository";
import { DaoRepository } from "../repositories/daoRepository";

const communityMintDecimals = 6;
const tokenAmount = 1;

export type MultiSigDaoResponse = {
  daoPk: PublicKey;
  communityMintPk: PublicKey;
  councilMintPk: PublicKey;
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

      const { communityMintPk, councilMintPk } = await this.createMintsForDao(
        walletPk
      );

      const { walletAtaPk } = await this.mintCouncilTokensToMembers(
        walletPk,
        councilWalletsPks,
        councilMintPk
      );

      const { daoPk } = await this.createConfiguredDao(
        name,
        yesVoteThreshold,
        walletPk,
        communityMintPk,
        councilMintPk,
        walletAtaPk
      );

      return {
        daoPk,
        communityMintPk: communityMintPk,
        councilMintPk: councilMintPk,
      };
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }

  private async mintCouncilTokensToMembers(
    walletPk: PublicKey,
    councilWalletsPks: PublicKey[],
    councilMintPk: PublicKey
  ): Promise<{
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

    const recentBlockhash2 = await this.connection.getLatestBlockhash();
    const councilTokenRelatedTx = new Transaction({
      blockhash: recentBlockhash2.blockhash,
      lastValidBlockHeight: recentBlockhash2.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    instructions.forEach((instruction) =>
      councilTokenRelatedTx.add(instruction)
    );

    const signedTxs2 = await this.wallet.signAllTransactions([
      councilTokenRelatedTx,
    ]);
    const recentBlockhash3 = await this.connection.getLatestBlockhash();

    await Promise.all(
      signedTxs2.map((signed) => {
        const rawTransaction = signed.serialize();
        return sendAndConfirmRawTransaction(this.connection, rawTransaction, {
          signature: base58.encode(signed.signature!),
          blockhash: recentBlockhash3.blockhash,
          lastValidBlockHeight: recentBlockhash3.lastValidBlockHeight,
        });
      })
    );

    return { walletAtaPk };
  }

  private async createMintsForDao(
    walletPk: PublicKey
  ): Promise<{ communityMintPk: PublicKey; councilMintPk: PublicKey }> {
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

    const recentBlockhash = await this.connection.getLatestBlockhash();
    const communityMintTx = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    const councilsMintTx = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    communityMint.instructions.forEach((instruction) =>
      communityMintTx.add(instruction)
    );

    if (communityMint.signers.length > 0) {
      communityMintTx.partialSign(...communityMint.signers);
    }

    councilMint.instructions.forEach((instruction) =>
      councilsMintTx.add(instruction)
    );

    if (councilMint.signers.length > 0) {
      councilsMintTx.partialSign(...councilMint.signers);
    }

    const signedTxs1 = await this.wallet.signAllTransactions([
      communityMintTx,
      councilsMintTx,
    ]);

    const recentBlockhash1 = await this.connection.getLatestBlockhash();

    await Promise.all(
      signedTxs1.map((signed) => {
        const rawTransaction = signed.serialize();
        return sendAndConfirmRawTransaction(this.connection, rawTransaction, {
          signature: base58.encode(signed.signature!),
          blockhash: recentBlockhash1.blockhash,
          lastValidBlockHeight: recentBlockhash1.lastValidBlockHeight,
        });
      })
    );
    return {
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
    walletAtaPk: PublicKey
  ): Promise<{ daoPk: PublicKey }> {
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

    const recentBlockhash4 = await this.connection.getLatestBlockhash();
    const realmRelatedTx = new Transaction({
      blockhash: recentBlockhash4.blockhash,
      lastValidBlockHeight: recentBlockhash4.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    instructions.forEach((instruction) => realmRelatedTx.add(instruction));

    const signedTxs3 = await this.wallet.signAllTransactions([realmRelatedTx]);
    const recentBlockhash5 = await this.connection.getLatestBlockhash();

    await Promise.all(
      signedTxs3.map((signed) => {
        const rawTransaction = signed.serialize();
        return sendAndConfirmRawTransaction(this.connection, rawTransaction, {
          signature: base58.encode(signed.signature!),
          blockhash: recentBlockhash5.blockhash,
          lastValidBlockHeight: recentBlockhash5.lastValidBlockHeight,
        });
      })
    );

    return { daoPk };
  }
}
