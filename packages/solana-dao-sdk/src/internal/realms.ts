import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import { createMint } from "./sdk/splToken/withCreateMint";
import base58 from "bs58";
import { createAssociatedTokenAccount } from "./sdk/splToken/withCreateAssociatedTokenAccount";
import {
  withCreateRealm,
  MintMaxVoteWeightSource,
  withDepositGoverningTokens,
  getTokenOwnerRecordAddress,
  GovernanceConfig,
  SetRealmAuthorityAction,
  VoteThreshold,
  VoteThresholdType,
  VoteTipping,
  withCreateMintGovernance,
  withSetRealmAuthority,
} from "@solana/spl-governance";
import { mintTo } from "./sdk/splToken/withMintTo";
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
} from "./sdk/units";
import BN from "bn.js";
import { TestWallet } from "..";

// Community mint decimals
const communityMintDecimals = 6;
export const MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY = 1000000;
// The community mint is going to have 0 supply and we arbitrarily set it to 1m
const minCommunityTokensToCreate = MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY;
const tokenAmount = 1;

export async function createMultisigRealm1(
  connection: Connection,
  wallet: TestWallet,
  councilWalletsPks: PublicKey[],
  programId: PublicKey,
  programVersion: number,
  name: string,
  yesVoteThreshold: number
) {
  try {
    const walletPk = wallet.publicKey;

    // Create community mint
    const communityMint = await createMint(
      connection,
      walletPk,
      null,
      communityMintDecimals,
      walletPk
    );

    // Create council mint
    const councilMint = await createMint(
      connection,
      walletPk,
      null,
      0,
      walletPk
    );

    // transaction signatures here for now
    const recentBlockhash = await connection.getLatestBlockhash();
    const communityMintTx = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: wallet.publicKey,
    });

    const councilsMintTx = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: wallet.publicKey,
    });

    communityMint.instructions.forEach((instruction) =>
      communityMintTx.add(instruction)
    );

    if (communityMint.signers.length > 0) {
      communityMintTx.partialSign(...communityMint.signers);
    }

    // For councilMembers =================
    councilMint.instructions.forEach((instruction) =>
      councilsMintTx.add(instruction)
    );

    if (councilMint.signers.length > 0) {
      councilsMintTx.partialSign(...councilMint.signers);
    }

    const signedTxs1 = await wallet.signAllTransactions([
      communityMintTx,
      councilsMintTx,
    ]);

    // signature.toString('base64')

    const recentBlockhash1 = await connection.getLatestBlockhash();

    const sentTxs1 = await Promise.all(
      signedTxs1.map((signed) => {
        const rawTransaction = signed.serialize();
        return sendAndConfirmRawTransaction(connection, rawTransaction, {
          signature: base58.encode(signed.signature!),
          blockhash: recentBlockhash1.blockhash,
          lastValidBlockHeight: recentBlockhash1.lastValidBlockHeight,
        });
      })
    );

    // Minting council tokens to council members

    const councilRelatedMintInstructions: TransactionInstruction[] = [];
    let walletAtaPk: PublicKey | undefined;

    for (const teamWalletPk of councilWalletsPks) {
      const ata = await createAssociatedTokenAccount(
        councilMint.publicKey,
        teamWalletPk,
        walletPk
      );

      // Mint 1 council token to each team member

      const mint = await mintTo(
        councilMint.publicKey,
        ata.publicKey,
        walletPk,
        tokenAmount
      );

      councilRelatedMintInstructions.push(
        ...ata.instructions,
        ...mint.instructions
      );

      if (teamWalletPk.equals(walletPk)) {
        walletAtaPk = ata.publicKey;
      }
    }

    // transaction signatures here for now
    const recentBlockhash2 = await connection.getLatestBlockhash();
    const councilTokenRelatedTx = new Transaction({
      blockhash: recentBlockhash2.blockhash,
      lastValidBlockHeight: recentBlockhash2.lastValidBlockHeight,
      feePayer: wallet.publicKey,
    });

    councilRelatedMintInstructions.forEach((instruction) =>
      councilTokenRelatedTx.add(instruction)
    );

    const signedTxs2 = await wallet.signAllTransactions([
      councilTokenRelatedTx,
    ]);
    const recentBlockhash3 = await connection.getLatestBlockhash();

    const sentTxs2 = await Promise.all(
      signedTxs2.map((signed) => {
        const rawTransaction = signed.serialize();
        return sendAndConfirmRawTransaction(connection, rawTransaction, {
          signature: base58.encode(signed.signature!),
          blockhash: recentBlockhash3.blockhash,
          lastValidBlockHeight: recentBlockhash3.lastValidBlockHeight,
        });
      })
    );

    // Create realm
    const realmInstructions: TransactionInstruction[] = [];

    // Convert to mint natural amount
    const minCommunityTokensToCreateAsMintValue = new BN(
      getMintNaturalAmountFromDecimal(
        minCommunityTokensToCreate,
        communityMintDecimals
      )
    );

    // Default to 100% supply
    const communityMintMaxVoteWeightSource =
      MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION;

    const realmPk = await withCreateRealm(
      realmInstructions,
      programId,
      programVersion,
      name,
      walletPk,
      communityMint.publicKey,
      walletPk,
      councilMint.publicKey,
      communityMintMaxVoteWeightSource,
      minCommunityTokensToCreateAsMintValue,
      undefined
    );

    let tokenOwnerRecordPk: PublicKey;

    // If the current wallet is in the team then deposit the council token
    if (walletAtaPk) {
      await withDepositGoverningTokens(
        realmInstructions,
        programId,
        programVersion,
        realmPk,
        walletAtaPk,
        councilMint.publicKey,
        walletPk,
        walletPk,
        walletPk,
        new BN(tokenAmount)
      );

      // TODO: return from withDepositGoverningTokens in the SDK
      tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
        programId,
        realmPk,
        councilMint.publicKey,
        walletPk
      );
    } else {
      // Let's throw for now if the current wallet isn't in the team
      // TODO: To fix it we would have to make it temp. as part of the team and then remove after the realm is created
      throw new Error("Current wallet must be in the team");
    }

    // Put community and council mints under the realm governance with default config
    const config = new GovernanceConfig({
      communityVoteThreshold: new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        value: yesVoteThreshold,
      }),
      minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
      // Do not use instruction hold up time
      minInstructionHoldUpTime: 0,
      // max voting time 3 days
      maxVotingTime: getTimestampFromDays(3),
      communityVoteTipping: VoteTipping.Strict,
      minCouncilTokensToCreateProposal: new BN(1),
      councilVoteThreshold: new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        value: 0,
      }),
      councilVetoVoteThreshold: new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        value: 0,
      }),
      communityVetoVoteThreshold: new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        value: yesVoteThreshold,
      }),
      councilVoteTipping: VoteTipping.Strict,
    });

    const communityMintGovPk = await withCreateMintGovernance(
      realmInstructions,
      programId,
      programVersion,
      realmPk,
      communityMint.publicKey,
      config,
      !!walletPk,
      walletPk,
      tokenOwnerRecordPk,
      walletPk,
      walletPk,
      undefined
    );

    // Set the community governance as the realm authority
    withSetRealmAuthority(
      realmInstructions,
      programId,
      programVersion,
      realmPk,
      walletPk,
      communityMintGovPk,
      SetRealmAuthorityAction.SetChecked
    );

    const recentBlockhash4 = await connection.getLatestBlockhash();
    const realmRelatedTx = new Transaction({
      blockhash: recentBlockhash4.blockhash,
      lastValidBlockHeight: recentBlockhash4.lastValidBlockHeight,
      feePayer: wallet.publicKey,
    });

    realmInstructions.forEach((instruction) => realmRelatedTx.add(instruction));

    const signedTxs3 = await wallet.signAllTransactions([realmRelatedTx]);
    const recentBlockhash5 = await connection.getLatestBlockhash();

    const sentTxs3 = await Promise.all(
      signedTxs3.map((signed) => {
        const rawTransaction = signed.serialize();
        return sendAndConfirmRawTransaction(connection, rawTransaction, {
          signature: base58.encode(signed.signature!),
          blockhash: recentBlockhash5.blockhash,
          lastValidBlockHeight: recentBlockhash5.lastValidBlockHeight,
        });
      })
    );

    console.log(sentTxs3);

    return {
      tx: [...signedTxs1, ...signedTxs2, ...signedTxs3].length,
      communityMintPk: communityMint.publicKey,
      councilMintPk: councilMint.publicKey,
    };
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}
