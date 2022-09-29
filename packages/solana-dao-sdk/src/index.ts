import { Connection, clusterApiUrl, PublicKey, ConfirmOptions, SendOptions, Signer, Transaction } from '@solana/web3.js';
import { RealmV2Serializer } from './internal/serialization';
import { splGovernanceProgram, SplGovernance } from "@project-serum/spl-governance";
import { Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@project-serum/anchor";

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
  minCommunityWeightToCreateGovernance: String; // TODO should be BN, but the test fails
  // The number of proposals in voting state
  votingProposalCount: number;
};

class NoOpWallet extends Wallet {
  constructor(){
    // a key pair we don't use but it's necessary in the constructor
    super(Keypair.generate());
  }
  signTransaction(tx: Transaction): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  get publicKey(): PublicKey {
    return PublicKey.default;
  }
  
}

/**
 * By default, Anchor expects a provider or default to Local which expects a valid wallet configured (i.e. node)
 */
class NoOpProvider extends AnchorProvider {
  constructor(connection: Connection){
    super(connection, new NoOpWallet(), AnchorProvider.defaultOptions())
  }
}

export class SolanaDao {
  connection: Connection;
  program: Program<SplGovernance>;
  serializer: RealmV2Serializer;
  
  constructor(connection?: Connection) {
    this.connection = connection ? connection : new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    this.program = splGovernanceProgram({provider: new NoOpProvider(this.connection)});
    this.serializer = new RealmV2Serializer(this.program.coder);
  }

  async getDao(publicKey: PublicKey): Promise<Dao | null> {
    
    const accountInfo = await this.connection.getAccountInfo(publicKey);
    if (!accountInfo) {
      return null;
    }
    const buffer: Buffer = accountInfo.data;    
    const realm = this.serializer.deserialize(buffer);
    
    return {
      publicKey: publicKey,
      name: realm.name,
      authority: realm.authority,
      communityMint: realm.communityMint,
      councilMint: realm.config.councilMint,
      minCommunityWeightToCreateGovernance: realm.config.minCommunityWeightToCreateGovernance.toString(10),
      votingProposalCount: realm.votingProposalCount
    };
  }
  getDaos(): Array<Dao> {
    throw new Error("Not implemented yet.");
  }
}
