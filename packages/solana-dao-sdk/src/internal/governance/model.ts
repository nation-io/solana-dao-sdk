/**
 * These types are literally a from the ones in the smart contract
 * https://github.com/solana-labs/solana-program-library/blob/6dfc68db1370c65076e8a860db74fd6483161d8a/governance/program/src/state/enums.rs#L7
 */
export enum AccountType {
    Uninitialized = 0,
    RealmV1 = 1,
    TokenOwnerRecordV1 = 2,
    GovernanceV1 = 3,
    ProgramGovernanceV1 = 4,
    ProposalV1 = 5,
    SignatoryRecordV1 = 6,
    VoteRecordV1 = 7,
    ProposalInstructionV1 = 8,
    MintGovernanceV1 = 9,
    TokenGovernanceV1 = 10,
    RealmConfig = 11,
    VoteRecordV2 = 12,
    ProposalTransactionV2 = 13,
    ProposalV2 = 14,
    ProgramMetadata = 15,
    RealmV2 = 16,
    TokenOwnerRecordV2 = 17,
    GovernanceV2 = 18,
    ProgramGovernanceV2 = 19,
    MintGovernanceV2 = 20,
    TokenGovernanceV2 = 21,
    SignatoryRecordV2 = 22,
  }