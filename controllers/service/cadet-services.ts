import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import { TokenData } from '../controllers.types.d.ts'
import { ServiceSchema } from '../../types.d.ts';
import { privateKey, populateServiceOptions } from '../../constants.ts';
import { getIntervals } from '../../utils/get-intervals.ts'
import db from '../../utils/db.ts';

export const cadetsServices = async (ctx: RouterContext<'/services/cadet/:id/:sort'>) => {
  const { response, params, cookies } = ctx;

  const { sort } = params;
  const id = new Bson.ObjectId(params.id);

  const token = await cookies.get('untkca', { signed: true });

  //setting the response type and status.
  response.status = 401;
  response.type = 'application/json';
  try {
    // if there is not token or if sort is diff than asc or desc, return error.
    if (!token || (sort !== 'asc' && sort !== 'desc')) throw new Error('You have not access to this resource.');

    // if request is not a websocket upgrade, return error.
    if (!ctx.isUpgradable) throw new Error('Unauthorized.');

    // if there is a token, verify it.
    const decoded = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // // if id of the token is not the same as the id of the cadet, return error.
    if (decoded._id !== params.id as unknown) throw new Error('You have not access to this resource.');

    // searching data in db
    const service_model = db.collection<ServiceSchema>('services');

    // taking dates for query
    const { first_date, last_date } = getIntervals(sort === 'asc');

    const services = await service_model.aggregate([
      { $match: { date_of_service: { $gte: sort === "asc" ? first_date : last_date, $lt: sort === "asc" ? last_date : first_date }, $or: [{ picked_up_by: id }, { delivered_by: id }] } },
      { $sort: { date_of_service: sort === 'asc' ? 1 : -1 } },
      ...populateServiceOptions,
    ]).toArray();

    const channel = new BroadcastChannel(`cadet-${id}`);

    const ws = ctx.upgrade();

    ws.onopen = (_event) => {
      const data = {
        action: 'initial',
        services,
      };
      ws.send(JSON.stringify(data));
    }

    channel.onmessage = (e) => {
      ws.send(e.data);
    };

    ws.onclose = () => {
      channel.close();
    };

    response.status = 200;
    response.body = { message: 'success' };
    return;

  } catch (error) {
    // if error exist, then return it
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}