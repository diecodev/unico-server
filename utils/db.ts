import { MongoClient } from "../deps.ts";

const client = new MongoClient();

const connectDB = async () => {
  await client.connect({
    db: Deno.env.get("DB_NAME") as string,
    tls: true,
    servers: [
      {
        host: Deno.env.get("DB_HOST0") as string,
        port: 27017,
      },
      {
        host: Deno.env.get("DB_HOST1") as string,
        port: 27017,
      },
      {
        host: Deno.env.get("DB_HOST2") as string,
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
