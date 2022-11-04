# Welcome to the Solana DAO SDK

First, thank you for contributing to our project!

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

At least for now that the project is private and in its initial state we will follow the [Github flow](https://docs.github.com/en/get-started/quickstart/github-flow) creating branches, PRs, and merging to main.

[Work in Progress]

We need to add the tools and frameworks we use or plan to add. ESLint, Prettier, Yarn, Lerna, Jest, Typescript and so on.

## Integration Tests

The integration tests run against a Solana validator that runs in a Docker container. The Docker image is maintained by @arielsegura and its entrypoint is `solana-test-validator`. We use a few options from this tool to copy the data we want from `mainnet-beta` to run a few assertions against real DAOs.

To update the governance program on integration tests, please refer to this [question](https://solana.stackexchange.com/questions/3977/how-can-i-download-a-deployable-program-from-mainnet).
