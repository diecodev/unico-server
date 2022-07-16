import db from './db.ts';
import { Bson } from '../deps.ts';
import { CadetSchema, ClientSchema, SchedulerSchema } from '../types.d.ts'

interface IParams {
  model: 'schedulers' | 'cadets' | 'clients';
  body: Partial<CadetSchema | ClientSchema | SchedulerSchema>;
  id: Bson.ObjectId
}

export const updateUser = async ({ model, body, id }: IParams) => {
  const collection = db.collection<CadetSchema | ClientSchema | SchedulerSchema>(model);
  const result = await collection.updateOne({ _id: id }, { $set: body });

  if (result.upsertedId) {
    const updated_user = await collection.findOne({ _id: result.upsertedId });
    return updated_user;
  }

  return undefined;
}