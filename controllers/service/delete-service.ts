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
    if (!token) throw new Error('No token found.');

    // Decoding the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // is role is not scheduler, throw an error
    if (payload.role !== 'agendador') throw new Error('You are not authorized to perform this action.');

    // creating the object id's for inserted service
    const _id = new Bson.ObjectId(params.id);

    // delete the service into the database
    const model = db.collection<ServiceSchema>('services.');
    const service_id = await model.findOne({ _id });
    const new_service = await model.deleteOne({ _id });

    if (!new_service) throw new Error('Service not found.');

    // sending the service id to the global, client and cadet channel
    const general_channel = new BroadcastChannel('global-services');
    const client_channel = new BroadcastChannel(`client-${service_id?.client_id}`);

    const data = {
      action: 'remove',
      service: {
        _id: params.id,
      }
    }

    general_channel.postMessage(JSON.stringify(data));
    client_channel.postMessage(JSON.stringify(data));

    /**
     * If service was assign to a cadet, send the service to the cadet channel
     * but, we need to verify if who picked the service is the same who delivered it
     */
    if (service_id?.picked_up_by && service_id.delivered_by) {
      const cadet_channel = new BroadcastChannel(`cadet-${service_id.picked_up_by}`);
      cadet_channel.postMessage(JSON.stringify(data));

      const cadet_channel_2 = new BroadcastChannel(`cadet-${service_id.delivered_by}`);
      (service_id.delivered_by !== service_id.picked_up_by) && cadet_channel_2.postMessage(JSON.stringify(data))
    }

    // return the new service
    response.status = 201;
    response.body = { message: 'Service deleted successfully.' };
    return

  } catch (error) {
    // if there is an error, return it in response body
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}