import { SolanaDao } from './index';
import { PublicKey, Connection } from '@solana/web3.js';
import { createWallet, randomId } from './test/utils';
import { StartedTestContainer, GenericContainer } from 'testcontainers';
import { governancePk } from './constants';

describe('SolanaDao', () => {
  let container: StartedTestContainer;
  let connection: Connection;
  const ukraineDAOPk = '5piGF94RbCqaogoFFWA9cYmt29qUpQejGCEjRKuwCz7d';
  const ukraineDAOAuthorityPk = '5We3g4zpinMcxSFrkvPWRzcSM5oRYxfWc9c8idefAQdi';
  const ukraineDAOCommunityMintPk =
    'ukrn3bJz9dzSN2VpF76ytpNcugXHEy4VuRou7bpizgF';
  const ukraineDAOCouncilMintPk = 'cUAxX8fEXdisGSgRnfL4aH3WeomK5b277XqHHS4U9z7';
  const ukraineDAOTokenOwnerRecordOne =
    '2kHNK3MvFotuUG78M61NHGy5aqAcsuNqtN9QtAE5ZiNu';
  const ukraineDAOTokenOwnerRecordTwo =
    'DwcS5tu22vFo7zk9YaX4eTfcrRN4kJLx4EGW7xJYWdTn';
  const ukraineDAOTokenOwnerRecordThree =
    'AkGpRaBxkezWJHrFjzZskHYTvUskWhVdvnDiLA2Kh1G5';
  const ukraineDAOTokenOwnerRecordFour =
    'AQ8QdVj4iZqPm25Cv81JQhG5J9Vco26vfRixncZZ5QTv';
  const ukraineDAOTokenOwnerRecordFive =
    '3MiaxuF6KFUuwKEUNid8trYowgTRfAR3aNBkrvbvUQwQ';
  const ukraineDAOTokenOwnerRecordSix =
    'FdcWVufA7qw3VfipQeBTMZTJqN8sC2fU3zCMB5mHYw8M';
  const governanceProgramExecutableData =
    'BZYjZ2ZbtAawP9WPt5yXszcoMWTvNFFX4AMbnDojtSGL';
  jest.setTimeout(40000);
  beforeAll(async () => {
    container = await new GenericContainer(
      'arisegura/solana-test-validator:v1.0.0',
    )
      .withCmd([
        'solana-test-validator',
        '--reset',
        '--url',
        'mainnet-beta',
        '--clone',
        ukraineDAOPk,
        '--clone',
        ukraineDAOAuthorityPk,
        '--clone',
        ukraineDAOCommunityMintPk,
        '--clone',
        ukraineDAOCouncilMintPk,
        '--clone',
        ukraineDAOTokenOwnerRecordOne,
        '--clone',
        ukraineDAOTokenOwnerRecordTwo,
        '--clone',
        ukraineDAOTokenOwnerRecordThree,
        '--clone',
        ukraineDAOTokenOwnerRecordFour,
        '--clone',
        ukraineDAOTokenOwnerRecordFive,
        '--clone',
        ukraineDAOTokenOwnerRecordSix,
        '--clone',
        governancePk.toBase58(),
        '--clone',
        governanceProgramExecutableData,
      ])
      .withExposedPorts(8899, 8900, 9900)
      .withDefaultLogDriver()
      .start();
    const solanaTestValidatorRpc = `http://${container.getHost()}:${container.getMappedPort(
      8899,
    )}`;
    const solanaTestValidatorWebSocket = `ws://${container.getHost()}:${container.getMappedPort(
      8900,
    )}`;

    connection = new Connection(solanaTestValidatorRpc, {
      commitment: 'confirmed',
      wsEndpoint: solanaTestValidatorWebSocket,
    });
  });

  test('calling getDao return a value', async () => {
    const client = new SolanaDao(connection);
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

  test('createDao creates a simpleDAO with default values', async () => {
    const userWallet = await createWallet(connection);
    const client = new SolanaDao(connection);
    client.setWallet(userWallet);

    const daoName = `dao ${randomId()}`;
    const createdDao = await client.createDao(daoName);
    const retrievedDao = await client.getDao(createdDao.daoPk);

    expect(retrievedDao?.name).toBe(daoName);

    const actualMembers = await client.getMembers(createdDao.daoPk);
    expect(actualMembers).toContainEqual({
      publicKey: userWallet.publicKey,
    });
  });
});
