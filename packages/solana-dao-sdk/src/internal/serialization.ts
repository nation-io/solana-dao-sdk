import { PublicKey } from '@solana/web3.js';
import { BinaryReader, BinaryWriter, deserialize, Schema } from 'borsh';
import { AccountType } from './governance/model';
import BN from 'bn.js';

export const extendBorsh = () => {
  (BinaryReader.prototype as any).readPubkey = function () {
    const reader = this as unknown as BinaryReader;
    const array = reader.readFixedArray(32);
    const pk = new PublicKey(array);
    return pk;
  };

  (BinaryWriter.prototype as any).writePubkey = function (value: PublicKey) {
    const writer = this as unknown as BinaryWriter;
    writer.writeFixedArray(value.toBuffer());
  };
};

extendBorsh();

// TODO move to some constants.ts
export const SYSTEM_PROGRAM_ID = new PublicKey(
    '11111111111111111111111111111111',
  );

class RealmConfig {
    accountType = AccountType.RealmConfig;
    realm: PublicKey;
    minCommunityTokensToCreateGovernance: BN;
    councilMint?: PublicKey;

    constructor(args: {
        realm: PublicKey;
        minCommunityTokensToCreateGovernance: BN;
        councilMint?: PublicKey;
    }) {
        this.realm = args.realm;
        this.minCommunityTokensToCreateGovernance = args.minCommunityTokensToCreateGovernance;
        this.councilMint = args.councilMint;
    }
}

class Realm {
    accountType = AccountType.RealmV2;
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

enum MintMaxVoteWeightSourceType {
  SupplyFraction = 0,
  Absolute = 1,
}

class MintMaxVoteWeightSource {
  type = MintMaxVoteWeightSourceType.SupplyFraction;
  value: BN;

  constructor(args: { value: BN }) {
    this.value = args.value;
  }
}

const realmV2BorshSchema: Schema = new Map<Function, any>(
    [
        [
          RealmConfig,
          {
            kind: 'struct',
            fields: [
              ['legacy1', 'u8'],
              ['legacy2', 'u8'],
              ['reserved', [6]],
              ['minCommunityTokensToCreateGovernance', 'u64'],
              ['communityMintMaxVoteWeightSource', MintMaxVoteWeightSource],
              ['councilMint', { kind: 'option', type: 'pubkey' }],
            ],
          },
        ],
        [
          Realm,
          {
            kind: 'struct',
            fields: [
              ['accountType', 'u8'],
              ['communityMint', 'pubkey'],
              ['config', RealmConfig],
              ['reserved', [6]],
              ['votingProposalCount', 'u16'],
              ['authority', { kind: 'option', type: 'pubkey' }],
              ['name', 'string'],
              ['reserved_v2', [128]],
            ],
          },
        ],
        [
          MintMaxVoteWeightSource,
          {
            kind: 'struct',
            fields: [
              ['type', 'u8'],
              ['value', 'u64'],
            ],
          },
        ]
    ]
)

export class RealmV2Serializer {
    deserialize(buffer: Buffer) {
        try {
          return deserialize(realmV2BorshSchema, Realm, buffer);
        } catch (e) {
          throw e;
        }
    }
}