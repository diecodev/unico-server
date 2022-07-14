import { SchedulerSchema, CadetSchema, ClientSchema } from "../types.d.ts";
import { encryptPassword } from "../constants.ts";
import db from "./db.ts";

export const insertScheduler = async (data: SchedulerSchema) => {
  const scheduler_collection = db.collection<SchedulerSchema>("schedulers");

  const scheduler_exists = await scheduler_collection.findOne({ username: data.username, $or: [{ email: data.email }, { phone: data.phone }] });

  if (scheduler_exists) throw new Error("The scheduler already exists.");

  const encrypted_password = encryptPassword(data.password);

  data.password = encrypted_password;

  const scheduler_id = await scheduler_collection.insertOne(data);

  const scheduler = await scheduler_collection.findOne({ _id: scheduler_id }) as Partial<SchedulerSchema>;

  delete scheduler.password;

  return scheduler;
}

export const insertCadet = async (data: CadetSchema) => {
  const cadet_collection = db.collection<CadetSchema>("cadets");

  const cadet_exists = await cadet_collection.findOne({ username: data.username, $or: [{ email: data.email }, { phone: data.phone }, { dni: data.dni }, { patent: data.patent }] });

  if (cadet_exists) throw new Error("The cadet already exists.");

  const encrypted_password = encryptPassword(data.password);

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

  const encrypted_password = encryptPassword(data.password);

  data.password = encrypted_password;

  const client_id = await client_collection.insertOne(data);

  const client = await client_collection.findOne({ _id: client_id }) as Partial<ClientSchema>;

  delete client.password;

  return client;
}