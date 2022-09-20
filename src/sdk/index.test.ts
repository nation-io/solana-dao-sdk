import { describe, expect, test } from "@jest/globals";
import { SolanaDao } from "./index";

describe("SolanaDao", () => {
  test("calling getDaos return a truthy value", () => {
    const client = new SolanaDao();
    expect(client.getDaos()).toBeTruthy();
  });
});
