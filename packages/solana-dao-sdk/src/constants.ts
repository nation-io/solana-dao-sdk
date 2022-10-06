import { PublicKey } from "@solana/web3.js";
import { MintMaxVoteWeightSource } from "@solana/spl-governance";

export const governanceProgramVersion = 2;
export const governancePk = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
);

export const DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE =
  MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION;
export const MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY = 1000000;
