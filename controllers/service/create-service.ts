import db from '../../utils/db.ts';
import { ServiceSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts';
import { getIntervals } from '../../utils/get-intervals.ts';
import { Context, verifyJwt, Bson } from '../../deps.ts';
import { isAnService } from '../../utils/interfaces-validator.ts';
import { privateKey } from '../../constants.ts'
import { getEnterpriseServices } from '../../utils/get-enterprise-services.ts';

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

    const client_channel = new BroadcastChannel(`client-${body.client_id}`);
    const general_channel = new BroadcastChannel('global-services');

    // insert the service into the database
    const model = db.collection<ServiceSchema>('services');
    await model.insertOne({ ...body, client_id, scheduled_by, date_of_service });

    // if date of service is today or next 7 days, send the service to client and global channel
    const { first_date, last_date } = getIntervals();
    if (date_of_service >= first_date && date_of_service <= last_date) {
      // Taking the inserted service from array
      const services = await getEnterpriseServices({ sort: 'asc' })

      // creating the object send to client and global channels
      const data = {
        action: 'add',
        services,
      }
      // sending the data to client channel
      client_channel.postMessage(JSON.stringify(data));
      // sending the data to general channel
      general_channel.postMessage(JSON.stringify(data));
    }

    // return a response to client
    response.status = 201;
    response.body = { message: 'Service created successfully' };
    return

  } catch (error) {
    // if there is an error, return it in response body
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}