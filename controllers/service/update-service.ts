import db from '../../utils/db.ts';
import { ServiceSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts'
import { getIntervals } from '../../utils/get-intervals.ts'
import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import { privateKey } from '../../constants.ts';
import { getEnterpriseServices } from '../../utils/get-enterprise-services.ts';

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
    const allocated_by = body.allocated_by ? new Bson.ObjectId(body.allocated_by) : undefined;
    const _id = new Bson.ObjectId(params.id);

    // insert the service into the database
    const model = db.collection<ServiceSchema>('services');
    const updated_service = await model.findAndModify({ _id }, { update: { $set: { ...body, client_id, date_of_service, delivered_by, picked_up_by, allocated_by, return_collected_money_to } }, new: true });

    // if there is no service, throw an error
    if (!updated_service) throw new Error('Service not found');

    const client_channel = new BroadcastChannel(`client-${updated_service.client_id}`);
    const general_channel = new BroadcastChannel('global-services');

    const { first_date, last_date } = getIntervals();

    if (updated_service.date_of_service >= first_date && updated_service.date_of_service <= last_date) {
      const services = await getEnterpriseServices({ sort: 'asc' });

      // seting data sended to channel
      const data = {
        action: 'initial',
        services,
      }

      // sending data to client channel
      client_channel.postMessage(JSON.stringify(data));
      // sending data to general channel
      general_channel.postMessage(JSON.stringify(data));

      /**
       * If service was assign to a cadet, send the service to the cadet channel
       * but, we need to verify if who picked the service is the same who delivered it
       */
      if (updated_service?.picked_up_by && updated_service.delivered_by) {
        const cadet_channel = new BroadcastChannel(`cadet-${updated_service.picked_up_by}`);
        cadet_channel.postMessage(JSON.stringify(data));

        const cadet_channel_2 = new BroadcastChannel(`cadet-${updated_service.delivered_by}`);
        (updated_service.delivered_by !== updated_service.picked_up_by) && cadet_channel_2.postMessage(JSON.stringify(data))
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