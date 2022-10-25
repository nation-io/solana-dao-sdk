import { SolanaDao } from './index';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { createWallet, randomId } from './test/utils';

describe('SolanaDao', () => {
  test('calling getDao return a value', async () => {
    const client = new SolanaDao();
    const actualDao = await client.getDao(
      new PublicKey('5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d'),
    );
    const expectedDao = {
      publicKey: new PublicKey('5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d'),
      name: 'Ukraine.SOL',
      authority: new PublicKey('5We3g4zpinMcxSFrkvPWRzcSM5oRYxfWc9c8idefAQdi'),
      communityMint: new PublicKey(
        'ukrn3bJz9dzSN2VpF76ytpNcugXHEy4VuRou7bpizgF',
      ),
      councilMint: new PublicKey('cUAxX8fEXdisGSgRnfL4aH3WeomK5b277XqHHS4U9z7'),
      minCommunityTokensToCreateGovernance: '1000000000000',
      votingProposalCount: 0,
    };
    expect(actualDao).toEqual(expectedDao);
  });

  test.skip('calling getMembers return values', async () => {
    const client = new SolanaDao();
    const actualMembers = await client.getMembers(
      new PublicKey('5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d'),
    );
    expect(actualMembers).toContainEqual({
      publicKey: new PublicKey('8nRQHj1RT7BQrhQ8jhRAoCUx8xrG4CxecNQRpyxvK7Zv'),
    });
    expect(actualMembers).toContainEqual({
      publicKey: new PublicKey('LXppnYxEkEHaNsWCPkNwZzTXMQepLpi1iHytb3wZ5Qd'),
    });
    expect(actualMembers).toContainEqual({
      publicKey: new PublicKey('5s9cM71STMqBYuk3oUztCSd2jjYh4G8RyxvFbdy3r4Qz'),
    });
    expect(actualMembers).toContainEqual({
      publicKey: new PublicKey('AJh9U6Vc22BXXiaspkeaDJSd4KL1Lz9Qrmd59XTfLNwo'),
    });
    expect(actualMembers).toContainEqual({
      publicKey: new PublicKey('EWcyEuktFMCUUzQ4vZPSjYtbBp3euwDJa8BN3MwZKVmY'),
    });
  });

  test('createDao creates a simpleDAO with default values', async () => {
    const devnetConnection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed',
    );
    const userWallet = await createWallet(devnetConnection);
    const client = new SolanaDao(devnetConnection);
    client.setWallet(userWallet);

    const daoName = `dao ${randomId()}`;

    const createdDao = await client.createDao(daoName);

    const retrievedDao = await client.getDao(createdDao.daoPk);

    expect(retrievedDao?.name).toBe(daoName);
  });
});
