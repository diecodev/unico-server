import { AssistantSchema, CadetSchema, ClientSchema } from "../types.d.ts";
import { bcrypt } from "../deps.ts";
import db from "./db.ts";

const envryptPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return await bcrypt.hashSync(password, salt);
}

export const insertAssistant = async (data: AssistantSchema) => {
  const assistant_collection = db.collection<AssistantSchema>("assistants");

  const assistant_exists = await assistant_collection.findOne({ username: data.username, $or: [{ email: data.email }, { phone: data.phone }] });

  if (assistant_exists) throw new Error("The assistant already exists.");

  const encrypted_password = await envryptPassword(data.password);

  data.password = encrypted_password;

  const assistant_id = await assistant_collection.insertOne(data);

  const assistant = await assistant_collection.findOne({ _id: assistant_id }) as Partial<AssistantSchema>;

  delete assistant.password;

  return assistant;
}

export const insertCadet = async (data: CadetSchema) => {
  const cadet_collection = db.collection<CadetSchema>("cadets");

  const cadet_exists = await cadet_collection.findOne({ username: data.username, $or: [{ email: data.email }, { phone: data.phone }, { dni: data.dni }, { patent: data.patent }] });

  if (cadet_exists) throw new Error("The cadet already exists.");

  const encrypted_password = await envryptPassword(data.password);

  data.password = encrypted_password;

  const cadet_id = await cadet_collection.insertOne(data);

  const cadet = await cadet_collection.findOne({ _id: cadet_id }) as Partial<CadetSchema>;

  delete cadet.password;

  return cadet;
}

export const insertClient = async (data: ClientSchema) => {
  const client_collection = db.collection<ClientSchema>("clients");

  const client_exists = await client_collection.findOne({ username: data.username, $or: [{ email: data.email }, { phone: data.phone }] });

  if (client_exists) throw new Error("The client already exists.");

  const encrypted_password = await envryptPassword(data.password);

  data.password = encrypted_password;

  const client_id = await client_collection.insertOne(data);

  const client = await client_collection.findOne({ _id: client_id }) as Partial<ClientSchema>;

  delete client.password;

  return client;
}