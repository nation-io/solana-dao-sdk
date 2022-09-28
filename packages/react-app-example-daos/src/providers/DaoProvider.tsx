import React, { createContext, PropsWithChildren, useContext } from "react";
import { SolanaDao } from "solana-dao-sdk";

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
    <DaoContext.Provider value={new SolanaDao()}>
      {children}
    </DaoContext.Provider>
  );
};
