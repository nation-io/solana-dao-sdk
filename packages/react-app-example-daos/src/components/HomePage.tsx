import { useEffect, useState } from 'react';
import { useDaoClient } from '../providers/DaoProvider';
import { PublicKey } from '@solana/web3.js';
import { Grid } from '@mui/material';
import { DaoCard } from './DaoCard';
import { Dao } from 'solana-dao-sdk/src';
import mainnetDaos from '../utils/mainnet.json';

type MainnetDao = {
  symbol: string;
  displayName: string;
  programId: string;
  realmId: string;
  bannerImage: string;
  ogImage: string;
  sharedWalletId: string;
  sortRank: number;
};

function toDao(jsonDao: MainnetDao): Partial<Dao> {
  return {
    publicKey: new PublicKey(jsonDao.realmId),
    name: jsonDao.displayName,
  };
}

function isValid(
  dao: Partial<Dao>,
): dao is { publicKey: PublicKey; name: string } {
  return !!dao.publicKey && !!dao.name;
}

export const Homepage: React.FunctionComponent = () => {
  const client = useDaoClient();
  const [daos, setDaos] = useState<Array<Partial<Dao>>>([]);

  useEffect(() => {
    const parsedDaos = (mainnetDaos as MainnetDao[]).map(toDao).slice(0, 20);
    // Since we haven't implemented the getDaos()
    // For now, we bring hardcoded mainnet daos
    // setDaos(client.getDaos());

    setDaos(parsedDaos);
  }, [client]);

  return (
    <div>
      <h1>All Daos</h1>
      <Grid container spacing={4}>
        {daos.filter(isValid).map((dao) => {
          return (
            <Grid item md={4} sm={4} xs={12} key={dao.publicKey.toString()}>
              <DaoCard id={dao.publicKey.toString()} name={dao.name} />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};
