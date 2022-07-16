import { TokenData } from '../controllers.types.d.ts';
import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import { ServiceSchema } from '../../types.d.ts';
import { privateKey } from '../../constants.ts';
import db from '../../utils/db.ts';

export const deleteService = async ({ response, cookies, params }: RouterContext<'/services/:id'>) => {
  // gettinf the token from the cookies
  const token = await cookies.get('untkad', { signed: true });

  // setting response status and content type
  response.status = 401;
  response.type = 'application/json';

  try {
    // if there is no token, throw an error
    if (!token) throw new Error('No token found');

    // Decoding the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // is role is not scheduler, throw an error
    if (payload.role !== 'agendador') throw new Error('You are not authorized to perform this action');

    // creating the object id's for inserted service
    const _id = new Bson.ObjectId(params.id);

    // delete the service into the database
    const model = db.collection<ServiceSchema>('services');
    const new_service = await model.deleteOne({ _id });

    if (!new_service) throw new Error('Service not found');

    // return the new service
    response.status = 201;
    response.body = { data: new_service };
    return

  } catch (error) {
    // if there is an error, return it in response body
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}