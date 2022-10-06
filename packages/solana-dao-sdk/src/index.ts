import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  getRealm,
  getAllTokenOwnerRecords,
  BN_ZERO,
} from "@solana/spl-governance";
import {
  DaoService,
  MultiSigDaoResponse,
} from "./internal/services/daoService";
import { Wallet } from "./wallet";

const DEFAULT_PROGRAM_ID = new PublicKey(
  "gUAedF544JeE6NYbQakQvribHykUNgaPJqcgf3UQVnY"
);
/**
 * Note: This interface is an abstraction introduced by the SDK so that consumers don't care about having to (de)serialize deprecated or unused fields
 * or the fact that some fields are nester in other objects.
 * For more info, check the smart contract https://github.com/solana-labs/solana-program-library/blob/a179eba71e63ba18128cc466e3fd0f7535f4c5fd/governance/program/src/state/realm.rs#L133
 */
export type Dao = {
  publicKey: PublicKey;
  name: string;
  // The current authority of the Realm
  authority?: PublicKey;
  // Mint address of the token to be used to represent voting power
  communityMint: PublicKey;
  // Optional mint address of the token to be used to represent voting power in the council
  councilMint?: PublicKey;
  // Min number of community tokens required to create a governance
  minCommunityTokensToCreateGovernance: String; // TODO should be BN, but the test fails
  // The number of proposals in voting state
  votingProposalCount: number;
};

/**
 * For more info, check the smart contract https://github.com/solana-labs/solana-program-library/blob/c5db9cec78097043fab5d1512acc1980ba43c0e3/governance/program/src/state/token_owner_record.rs#L34
 */
export type Member = {
  publicKey: PublicKey;
};
export class SolanaDao {
  connection: Connection;
  wallet: Wallet | null = null;
  service: DaoService;

  constructor(connection?: Connection) {
    this.connection = connection
      ? connection
      : new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

    this.service = new DaoService(this.connection, this.wallet);
  }

  setWallet(wallet: Wallet) {
    this.wallet = wallet;
    this.service.setWallet(wallet);
  }

  async createDao(
    councilWalletsPks: PublicKey[],
    name: string,
    yesVoteThreshold: number
  ): Promise<MultiSigDaoResponse> {
    if (!this.wallet) {
      throw new Error("There is no wallet available");
    }

    const response = await this.service.createMultisigDao(
      councilWalletsPks,
      name,
      yesVoteThreshold
    );

    return response;
  }

  async getDao(daoPublicKey: PublicKey): Promise<Dao | null> {
    const realm = (await getRealm(this.connection, daoPublicKey)).account;

    return {
      publicKey: daoPublicKey,
      name: realm.name,
      authority: realm.authority,
      communityMint: realm.communityMint,
      councilMint: realm.config.councilMint,
      minCommunityTokensToCreateGovernance:
        realm.config.minCommunityTokensToCreateGovernance.toString(10),
      votingProposalCount: realm.votingProposalCount,
    };
  }

  async getMembers(daoPublicKey: PublicKey): Promise<Member[]> {
    const allTokenRecords = await getAllTokenOwnerRecords(
      this.connection,
      DEFAULT_PROGRAM_ID,
      daoPublicKey
    );
    return allTokenRecords
      .map((record) => record.account)
      .filter((account) => account.governingTokenDepositAmount.gt(BN_ZERO))
      .map((account) => ({ publicKey: account.governingTokenOwner }));
  }

  getDaos(): Array<Dao> {
    throw new Error("Not implemented yet.");
  }
}
