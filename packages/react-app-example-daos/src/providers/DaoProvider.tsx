import React, { createContext, PropsWithChildren, useContext } from "react";
import { SolanaDao } from "solana-dao-sdk";
import { Connection, clusterApiUrl } from "@solana/web3.js";

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
  const devnetConnection = new Connection(clusterApiUrl("devnet"), "finalized");
  return (
    <DaoContext.Provider value={new SolanaDao(devnetConnection)}>
      {children}
    </DaoContext.Provider>
  );
};
