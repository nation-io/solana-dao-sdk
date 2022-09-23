import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { SolanaDao } from "solana-dao-sdk";

const client = new SolanaDao();

function App() {
  const [daos, setDaos] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    setDaos(client.getDaos());
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {daos.map((dao) => {
          return <DaoCard key={dao.id} id={dao.id} name={dao.name} />;
        })}
      </header>
    </div>
  );
}

const DaoCard: React.FunctionComponent<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  return (
    <div className="dao-card">
      <p>{id}</p>
      <p>{name}</p>
    </div>
  );
};

export default App;
