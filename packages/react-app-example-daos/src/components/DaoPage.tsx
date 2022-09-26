import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dao } from "solana-dao-sdk/src";
import { useDaoClient } from "../providers/DaoProvider";

export const DaoPage: React.FunctionComponent = () => {
  const client = useDaoClient();
  let { id } = useParams();

  const [dao, setDao] = useState<Dao | null>(null);

  useEffect(() => {
    setDao(client.getDao());
  }, [client, id]);

  if (!dao) {
    return <div>Dao not found</div>;
  }

  return (
    <div>
      <h1>Dao information</h1>
      <p>Disclaimer: this is fake data for now</p>
      {dao.id}
      {dao.name}
    </div>
  );
};
