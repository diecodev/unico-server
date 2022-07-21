import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import { TokenData } from '../controllers.types.d.ts'
import { ServiceSchema, EventDataProps } from '../../types.d.ts';
import { privateKey, populateServiceOptions } from '../../constants.ts';
import { getIntervals } from '../../utils/get-intervals.ts'
import db from '../../utils/db.ts';

export const cadetsServices = async ({ response, params, cookies }: RouterContext<'/services/cadet/:id/:sort'>) => {
  const { sort } = params;
  const id = new Bson.ObjectId(params.id);

  const token = await cookies.get('untkca', { signed: true });

  //setting the response type and status.
  response.status = 401;
  response.type = 'application/json';
  try {
    // if there is not token or if sort is diff than asc or desc, return error.
    if (!token || (sort !== 'asc' && sort !== 'desc')) throw new Error('You have not access to this resource.');

    // if there is a token, verify it.
    const decoded = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // // if id of the token is not the same as the id of the cadet, return error.
    if (decoded._id !== id) throw new Error('You have not access to this resource.');

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

    const stream = new ReadableStream({
      start: (controller) => {
        const firstdata = `data: ${JSON.stringify({ services })}\n\n`;
        controller.enqueue(firstdata);

        channel.onmessage = (event) => {
          const dataJSON = JSON.parse(event.data) as EventDataProps;

          const data = `data: ${JSON.stringify(dataJSON)}\n\n`
          controller.enqueue(data);
        }
      },

      cancel() {
        channel.close();
      }
    })

    response.status = 200;
    response.type = 'text/event-stream';
    response.body = stream.pipeThrough(new TextEncoderStream());
    return;

  } catch (error) {
    // if error exist, then return it
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}