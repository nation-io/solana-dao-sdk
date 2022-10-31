# Solana DAO SDK

A simplified javascript SDK for interacting with DAOs.

The Solana DAO SDK is a wrapper on top of @solana/spl-governance which is used to interact with smart contracts on Realms

## Installation

For now, there are very few commands and will change soon.

- Installing dependencies

```bash
yarn install ## or npm install
```

- Build the SDK library and the React sample frontend

```bash
yarn build
```

- Build the SDK library

```bash
yarn build:sdk
```

- Build the SDK library in watch mode.

```bash
# Being in the packages/solana-dao-sdk folder
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

## Getting Started

Some sample code to import the SDK and run some of the SDK functions:

```jsx
import { SolanaDao } from "solana-dao-sdk"; //SDK is imported here
import { PublicKey } from "@solana/web3.js";

let id = "abc123"
const client = new SolanaDao()

client.createDAO("myDaoName",[new PublicKey(id)],100)
client.getDao(new PublicKey(id))
client.getMembers(new PublicKey(id))

```

## Sample Code

Here is some sample code to import the SDK and create a Provider that provides the SolanaDAO object.

```jsx
import React, { createContext, PropsWithChildren, useContext } from "react";
import { SolanaDao } from "solana-dao-sdk"; //SDK is imported here

type ContextType = SolanaDao;

export const DaoContext = createContext<ContextType | null>(null);

export const useDaoClient = (): ContextType => {
  const value = useContext(DaoContext);

  if (value === null) {
    throw new Error("useDaoClient must be used within a DaoProvider");
  }

  return value;
};

export const DaoProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  return (
    <DaoContext.Provider value={new SolanaDao()}> //Creating the provider for the SolanaDao object
      {children}
    </DaoContext.Provider>
  );
};

```

Here is some sample code consuming the Provider:

```jsx
import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "react-router-dom";
import { Dao } from "solana-dao-sdk/src";
import { useDaoClient } from "../providers/DaoProvider";

export const DaoPage: React.FunctionComponent = () => {
  const client = useDaoClient(); // creating a SolanaDAO object using the Provider
  let { id } = useParams();

  const [dao, setDao] = useState<Dao | null>(null);

  const fetchDao = useCallback(async () => {
    if (!id) {
      return null;
    }

    return client.getDao(new PublicKey(id)); //using the getDAO() function
  }, [client, id]);

  useEffect(() => {
    fetchDao().then(setDao);
  }, [fetchDao]);

  if (!dao) {
    return <div>Dao not found</div>;
  }

  return (
    <div>
      <h1>Dao information</h1>
      {dao && (
        <div>
          {dao.publicKey.toString()}
          {dao.name}
        </div>
      )}
    </div>
  );
};

```

## Example

A simple frontend that utilizes the SDK has been provided. It uses the sample code shown above.

You can run the example with `yarn web`
