# Solana DAO SDK

A simplified javascript SDK for interacting with DAOs.

The Solana DAO SDK is a wrapper on top of @solana/spl-governance which is used to interact with smart contracts on Realms

## Getting Started

For now, there are very few commands and will change soon.

- Installing dependencies

```bash
yarn install ## or npm install
```

- Build the SDK library

```bash
yarn build
```

- Build the SDK library in watch mode.

```bash
yarn watch
```

- Running a frontend example using the SDK.

```bash
yarn web
```

## SDK Functions

This SDK exports a SolanaDAO class that is used to instantiate an object containing the following functions:

- createDAO 
  - used for creating a new DAO.
  - parameters: 
    - name: string,
    - councilWalletPks: PublicKey[] = [],
    - yesVoteThreshold: number = 60,
  - returns:
    - Promise<MultiSigDaoResponse>
- getDao
  - used for getting info from an existing DAO
  - parameters: 
    - daoPublicKey: PublicKey
  - returns:
    - Promise<Dao>
- getMembers
  - used for getting members of a Dao
  - parameters:
    - daoPublicKey: PublicKey
  - returns:
    - Promise<Member[]>


## Example
A simple frontend that utilizes the SDK has been provided. You can run the example with `yarn web`
