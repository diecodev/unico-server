import { isAnService } from '../../utils/interfaces-validator.ts';
import { TokenData } from '../controllers.types.d.ts'
import { Context, verifyJwt, Bson } from '../../deps.ts';
import { ServiceSchema } from '../../types.d.ts';
import { privateKey } from '../../constants.ts'
import db from '../../utils/db.ts';

export const createService = async ({ request, response, cookies }: Context) => {
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

    // getting the body of the request
    const body = await request.body({ type: 'json' }).value as ServiceSchema;

    // creating the object id's for inserted service
    const client_id = new Bson.ObjectId(body.client_id);
    const scheduled_by = new Bson.ObjectId(payload._id);
    const date_of_service = new Date(body.date_of_service);

    // checking if the body is a service object
    const is_valid = isAnService(body)

    // if body is not a service object, throw an error
    if (!is_valid) throw new Error('Invalid data');

    // insert the service into the database
    const model = db.collection<ServiceSchema>('services');
    const new_service = await model.insertOne({ ...body, client_id, scheduled_by, date_of_service });
    const service = await model.findOne({ _id: new_service });

    // return the new service
    response.status = 201;
    response.body = { data: service };
    return

  } catch (error) {
    // if there is an error, return it in response body
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}