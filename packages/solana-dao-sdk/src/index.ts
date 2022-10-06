import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { getRealm } from '@solana/spl-governance';

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

export class SolanaDao {
  connection: Connection;
  
  constructor(connection?: Connection) {
    this.connection = connection ? connection : new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  }

  async getDao(publicKey: PublicKey): Promise<Dao | null> {
    const realm = (await getRealm(this.connection, publicKey)).account;
    
    return {
      publicKey: publicKey,
      name: realm.name,
      authority: realm.authority,
      communityMint: realm.communityMint,
      councilMint: realm.config.councilMint,
      minCommunityTokensToCreateGovernance: realm.config.minCommunityTokensToCreateGovernance.toString(10),
      votingProposalCount: realm.votingProposalCount
    };
  }
  getDaos(): Array<Dao> {
    throw new Error("Not implemented yet.");
  }
}
