import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  DaoService,
  MultiSigDaoResponse,
} from "./internal/services/daoService";
import { Wallet } from "./wallet";

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
  minCommunityTokensToCreateGovernance: string; // TODO should be BN, but the test fails
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
    name: string,
    councilWalletsPks: PublicKey[] = [],
    yesVoteThreshold = 60
  ): Promise<MultiSigDaoResponse> {
    if (!this.wallet) {
      throw new Error("There is no wallet available");
    }

    if (councilWalletsPks.length === 0) {
      councilWalletsPks.push(this.wallet.publicKey);
    }

    return this.service.createMultisigDao(
      councilWalletsPks,
      name,
      yesVoteThreshold
    );
  }

  async getDao(daoPublicKey: PublicKey): Promise<Dao | null> {
    return this.service.getDao(daoPublicKey);
  }

  async getMembers(daoPublicKey: PublicKey): Promise<Member[]> {
    return this.service.getMembers(daoPublicKey);
  }

  getDaos(): Array<Dao> {
    throw new Error("Not implemented yet.");
  }
}
