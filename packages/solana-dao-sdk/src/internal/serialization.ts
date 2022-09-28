import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Coder } from '@project-serum/anchor';

class RealmConfig {
    realm: PublicKey;
    minCommunityWeightToCreateGovernance: BN;
    councilMint?: PublicKey;

    constructor(args: {
        realm: PublicKey;
        minCommunityWeightToCreateGovernance: BN;
        councilMint?: PublicKey;
    }) {
        this.realm = args.realm;
        this.minCommunityWeightToCreateGovernance = args.minCommunityWeightToCreateGovernance;
        this.councilMint = args.councilMint;
    }
}

// types doesn't seem to be exported for spl-governance on Anchor :(
class Realm {
    communityMint: PublicKey;
    config: RealmConfig;
    reserved: Uint8Array;
    votingProposalCount: number;
    authority?: PublicKey;
    name: string;
  
    constructor(args: {
      communityMint: PublicKey;
      reserved: Uint8Array;
      config: RealmConfig;
      votingProposalCount: number;
      authority?: PublicKey;
      name: string;
    }) {
      this.communityMint = args.communityMint;
      this.config = args.config;
      this.reserved = args.reserved;
      this.votingProposalCount = args.votingProposalCount;
      this.authority = args.authority;
      this.name = args.name;
    }
}

export class RealmV2Serializer {
    constructor(readonly coder: Coder){}
    deserialize(buffer: Buffer): Realm {
        try {
          return this.coder.accounts.decode<Realm>("realmV2", buffer);
        } catch (e) {
          throw e;
        }
    }
}