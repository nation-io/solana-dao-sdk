export type Dao = {
  id: string;
  name: string;
  title?: string;
};

const mockDaos: Array<Dao> = [
  {
    id: "ukraine",
    name: "Ukraine.SOL",
  },
  {
    id: "mango-dao",
    name: "Mango DAO",
  },
  {
    id: "psy-finance",
    name: "Psy Finance",
  },
  {
    id: "grape",
    name: "GRAPE",
  },
  {
    id: "solend-dao",
    name: "Solend DAO",
  },
];

export class SolanaDao {
  getDao(): Dao {
    return mockDaos[0];
  }
  getDaos(): Array<Dao> {
    return mockDaos;
  }
}
