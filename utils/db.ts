import { dotEnv, MongoClient } from "../deps.ts";

const client = new MongoClient();

const connectDB = async () => {
  dotEnv({ export: true });
  await client.connect({
    db: Deno.env.get("DB_NAME") as string,
    tls: true,
    servers: [
      {
        host: Deno.env.get("DB_HOST") as string,
        port: 27017,
      },
    ],
    credential: {
      username: Deno.env.get("DB_USERNAME") as string,
      password: Deno.env.get("DB_PASSWORD") as string,
      db: Deno.env.get("DB_NAME") as string,
      mechanism: "SCRAM-SHA-1",
    },
  });

  const db = client.database("unicoWebDB");

  return db;
};

const db = await connectDB();

export default db;
