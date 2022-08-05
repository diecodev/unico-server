import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import { TokenData } from '../controllers.types.d.ts'
import { ServiceSchema } from '../../types.d.ts';
import { privateKey, populateServiceOptions } from '../../constants.ts';
import { getIntervals } from '../../utils/get-intervals.ts'
import db from '../../utils/db.ts';

export const roleServices = async (ctx: RouterContext<'/services/:role/:id'>) => {
  const { response, params, cookies } = ctx;

  const { role } = params;
  const id = new Bson.ObjectId(params.id);

  const token = await cookies.get('untkad', { signed: true });

  //setting the response type and status.
  response.status = 401;
  response.type = 'application/json';
  try {
    // if there is not token or if sort is diff than asc or desc, return error.
    if (!token || (role !== 'clients' && role !== 'cadets' && role !== 'schedulers')) throw new Error('You have not access to this resource.');

    // if there is a token, verify it.
    const decoded = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if the user is not an admin or scheduler, return error.
    if (decoded.role !== 'admin' && decoded.role !== 'agendador') throw new Error('You have not access to this resource.');

    // searching data in db
    const service_model = db.collection<ServiceSchema>('services');

    // taking dates for query
    const { first_date } = getIntervals();

    const services = await service_model.aggregate([
      { $match: { date_of_service: { $lte: first_date }, $or: [{ picked_up_by: id }, { delivered_by: id }, { client_id: id }, { scheduled_by: id }] } },
      { $sort: { date_of_service: -1 } },
      ...populateServiceOptions,
      {
        $group: {
          _id: id, services: { $push: '$$ROOT' }, collect_money_total_amount: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $and: [{ $eq: ['$client_id._id', id] }, { collect_money: true }] }, then: '$collect_money_amount' },
                  { case: { $eq: ['$return_collected_money_to', id] }, then: '$collect_money_amount' },
                ],
                default: 0,
              }
            }
          },
        }
      }
    ]).toArray();

    response.status = 200;
    response.body = { data: services };
    return;

  } catch (error) {
    // if error exist, then return it
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}