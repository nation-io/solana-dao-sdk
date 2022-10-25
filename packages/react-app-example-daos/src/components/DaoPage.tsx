import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useParams } from 'react-router-dom';
import { Dao } from 'solana-dao-sdk/src';
import { useDaoClient } from '../providers/DaoProvider';

export const DaoPage: React.FunctionComponent = () => {
  const client = useDaoClient();
  let { id } = useParams();

  const [dao, setDao] = useState<Dao | null>(null);

  const fetchDao = useCallback(async () => {
    if (!id) {
      return null;
    }

    return client.getDao(new PublicKey(id));
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
