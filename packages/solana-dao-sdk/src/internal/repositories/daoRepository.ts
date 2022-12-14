import {
  withCreateRealm,
  withDepositGoverningTokens,
  getTokenOwnerRecordAddress,
  GovernanceConfig,
  SetRealmAuthorityAction,
  VoteThreshold,
  VoteThresholdType,
  VoteTipping,
  withCreateMintGovernance,
  withSetRealmAuthority,
} from '@solana/spl-governance';
import BN from 'bn.js';
import {
  DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE,
  governancePk,
  governanceProgramVersion,
  MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY,
} from '../../constants';
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
} from '../units';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Wallet } from '../../wallet';

const communityMintDecimals = 6;
const tokenAmount = 1;

export class DaoRepository {
  connection: Connection;
  wallet: Wallet | null;

  constructor(connection: Connection, wallet: Wallet | null) {
    this.connection = connection;
    this.wallet = wallet;
  }

  public setWallet(wallet: Wallet) {
    this.wallet = wallet;
  }

  public async createDao(
    name: string,
    yesVoteThreshold: number,
    walletPk: PublicKey,
    communityMintPk: PublicKey,
    councilMintPk: PublicKey,
    walletAssociatedTokenAccountPk: PublicKey,
  ): Promise<{
    daoPk: PublicKey;
    instructions: TransactionInstruction[];
  }> {
    const communityTokenConfig = undefined;
    const councilTokenConfig = undefined;
    const voterWeightRecord = undefined;
    const instructions: TransactionInstruction[] = [];

    const minCommunityTokensToCreateAsMintValue = new BN(
      getMintNaturalAmountFromDecimal(
        MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY,
        communityMintDecimals,
      ),
    );

    const realmPk = await withCreateRealm(
      instructions,
      governancePk,
      governanceProgramVersion,
      name,
      walletPk,
      communityMintPk,
      walletPk,
      councilMintPk,
      DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE,
      minCommunityTokensToCreateAsMintValue,
      communityTokenConfig,
      councilTokenConfig,
    );

    await withDepositGoverningTokens(
      instructions,
      governancePk,
      governanceProgramVersion,
      realmPk,
      walletAssociatedTokenAccountPk,
      councilMintPk,
      walletPk,
      walletPk,
      walletPk,
      new BN(tokenAmount),
    );

    const tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
      governancePk,
      realmPk,
      councilMintPk,
      walletPk,
    );

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
      instructions,
      governancePk,
      governanceProgramVersion,
      realmPk,
      communityMintPk,
      config,
      !!walletPk,
      walletPk,
      tokenOwnerRecordPk,
      walletPk,
      walletPk,
      voterWeightRecord,
    );

    // Set the community governance as the realm authority
    withSetRealmAuthority(
      instructions,
      governancePk,
      governanceProgramVersion,
      realmPk,
      walletPk,
      communityMintGovPk,
      SetRealmAuthorityAction.SetChecked,
    );

    return { daoPk: realmPk, instructions };
  }
}
