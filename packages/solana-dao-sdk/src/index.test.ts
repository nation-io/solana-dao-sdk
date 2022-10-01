import { SolanaDao } from "./index";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

describe("SolanaDao", () => {
  test("calling getDao return a value", async () => {
    const client = new SolanaDao();
    const actualDao = await client.getDao(new PublicKey("5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d"));
    const expectedDao = {
        publicKey: new PublicKey("5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d"),
        name: "Ukraine.SOL",
        authority: new PublicKey("5We3g4zpinMcxSFrkvPWRzcSM5oRYxfWc9c8idefAQdi"),
        communityMint: new PublicKey("ukrn3bJz9dzSN2VpF76ytpNcugXHEy4VuRou7bpizgF"),
        councilMint: new PublicKey("cUAxX8fEXdisGSgRnfL4aH3WeomK5b277XqHHS4U9z7"),
        minCommunityTokensToCreateGovernance: "1000000000000",
        votingProposalCount: 0
    };
    expect(actualDao).toEqual(expectedDao);
  });
});
