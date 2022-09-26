import { useEffect, useState } from "react";
import { useDaoClient } from "../providers/DaoProvider";
import { Grid } from "@mui/material";
import { DaoCard } from "./DaoCard";

export const Homepage: React.FunctionComponent = () => {
  const client = useDaoClient();
  const [daos, setDaos] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    setDaos(client.getDaos());
  }, [client]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>All Daos</h1>
        <Grid container spacing={4}>
          {daos.map((dao) => {
            return (
              <Grid item md={4}>
                <DaoCard key={dao.id} id={dao.id} name={dao.name} />
              </Grid>
            );
          })}
        </Grid>
      </header>
    </div>
  );
};
