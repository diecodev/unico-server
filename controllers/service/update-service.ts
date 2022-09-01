import db from '../../utils/db.ts';
import { ServiceSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts'
import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import { privateKey, populateServiceOptions } from '../../constants.ts';
import { getIntervals } from '../../utils/get-intervals.ts'

export const updateService = async ({ request, response, cookies, params }: RouterContext<'/services/:id'>) => {
  // gettinf the token from the cookies
  const token = await cookies.get('untkad', { signed: true }) || await cookies.get('untkca', { signed: true });

  // setting response status and content type
  response.status = 401;
  response.type = 'application/json';

  try {
    // if there is no token, throw an error
    if (!token) throw new Error('No token found');

    // Decoding the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // is role is not scheduler, throw an error
    if (payload.role !== 'agendador' && payload.role !== 'asignador' && payload.role !== 'cadete') throw new Error('You are not authorized to perform this action');

    // getting the body of the request
    const body = await request.body({ type: 'json' }).value as ServiceSchema;

    // creating the object id's for inserted service
    const client_id = body.client_id ? new Bson.ObjectId(body.client_id) : undefined;
    const date_of_service = body.date_of_service ? new Date(body.date_of_service) : undefined;
    const delivered_by = body.delivered_by ? new Bson.ObjectId(body.delivered_by) : undefined;
    const picked_up_by = body.picked_up_by ? new Bson.ObjectId(body.picked_up_by) : undefined;
    const return_collected_money_to = body.return_collected_money_to ? new Bson.ObjectId(body.return_collected_money_to) : undefined;
    const _id = new Bson.ObjectId(params.id);

    // insert the service into the database
    const model = db.collection<ServiceSchema>('services');
    const updated_service = await model.findAndModify({ _id }, { update: { $set: { ...body, client_id, date_of_service, delivered_by, picked_up_by, return_collected_money_to } } });

    // if there is no service, throw an error
    if (!updated_service) throw new Error('Service not found');

    const client_channel = new BroadcastChannel(`client-${updated_service.client_id}`);
    const general_channel = new BroadcastChannel('global-services');

    // populating updated service
    const service_populated = await model.aggregate([
      { $match: { _id } },
      ...populateServiceOptions,
    ]).toArray() as ServiceSchema[];

    // taking service from array
    const service = service_populated[0];

    const { first_date, last_date } = getIntervals();
    if (service.date_of_service >= first_date && service.date_of_service <= last_date) {
      // seting data sended to channel
      const data = {
        action: 'update',
        service,
      }

      // sending data to client channel
      client_channel.postMessage(JSON.stringify(data));
      // sending data to general channel
      general_channel.postMessage(JSON.stringify(data));

      /**
       * If service was assign to a cadet, send the service to the cadet channel
       * but, we need to verify if who picked the service is the same who delivered it
       */
      if (service?.picked_up_by && service.delivered_by) {
        const cadet_channel = new BroadcastChannel(`cadet-${service.picked_up_by}`);
        cadet_channel.postMessage(JSON.stringify(data));

        const cadet_channel_2 = new BroadcastChannel(`cadet-${service.delivered_by}`);
        (service.delivered_by !== service.picked_up_by) && cadet_channel_2.postMessage(JSON.stringify(data))
      }
    }

    response.status = 201;
    response.body = { message: 'Service updated successfully' };
    return

  } catch (error) {
    // if there is an error, return it in response body
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}