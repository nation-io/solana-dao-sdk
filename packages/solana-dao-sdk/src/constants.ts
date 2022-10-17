import { PublicKey } from "@solana/web3.js";
import { MintMaxVoteWeightSource } from "@solana/spl-governance";

export const governanceProgramVersion = 2;
export const governancePk = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
);

export const DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE =
  MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION;
export const MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY = 1000000;

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
