# Welcome to the Solana DAO SDK

First, thank you for contributing to our project!

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

At least for now that the project is private and in its initial state we will follow the [Github flow](https://docs.github.com/en/get-started/quickstart/github-flow) creating branches, PRs, and merging to main.

## Code guidelines

The goal of these guidelines is to improve developer productivity by allowing
developers to jump into any file in the codebase and not need to adapt to
inconsistencies in how the code is written. This means that we prefer consistency over correctness, but we are always open to change.

If you want to address a specific guideline, submit a separate PR for that reflecting all the changes required.

## Pull Requests

Small, frequent PRs are much preferred to large, infrequent ones. A large PR is
difficult to review, can block others from making progress, and can quickly get
its author into rebase hell.

A review on PRs is expected within a week.

### I can't split it into smaller PRs

Sure, we've all been there. If the work you are doing requires significant changes, it would be a good idea to make the review easier by:

- Grouping changes by a few commits
- Ammend commits when needed (avoid commits like `fix typo`, `fix formatting`, `PR feedback`, etc)
- Write a great and descriptive commit message
- Commit in order so that the reviewer can follow the changes in the right order

### Draft PRs

Draft PRs are preferred as a way of discussing changes. Feel free to send one, even if it doesn't compile yet. Don't expect a review on draft PRs.

## Opening an issue

While we don't have a template for opening issues, we encourage you that you are very specific about:

- The underlying issue (do some research, i.e. don't post an issue saying `it doesn't work`)
- Steps to reproduce
- Environment: environment, OS, solana version etc
- Proposal: If you happen to know how we may fix the issue, we are more than happy to hear that and you are more than welcome to send a PR!

## Integration Tests

The integration tests run against a Solana validator that runs in a Docker container. The Docker image is maintained by @arielsegura and its entrypoint is `solana-test-validator`. We use a few options from this tool to copy the data we want from `mainnet-beta` to run a few assertions against real DAOs.

To update the governance program on integration tests, please refer to this [question](https://solana.stackexchange.com/questions/3977/how-can-i-download-a-deployable-program-from-mainnet).
