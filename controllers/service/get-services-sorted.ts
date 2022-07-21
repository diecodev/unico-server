import type { AdminSchema, EventDataProps } from '../../types.d.ts';
import { RouterContext, verifyJwt } from '../../deps.ts';
import { privateKey } from '../../constants.ts';
import { getEnterpriseServices } from '../../utils/get-enterprise-services.ts';

export const getServicesSorted = async ({ cookies, response, params }: RouterContext<'/services/:sort'>) => {
  const token = await cookies.get('untkad', { signed: true });

  response.status = 401;
  response.type = 'application/json';

  const { sort } = params;

  try {
    if (!token || (sort !== 'asc' && sort !== 'desc')) throw new Error('Unauthorized.');

    const decoded_token = (await verifyJwt(token, privateKey)).payload as unknown as AdminSchema;

    if (decoded_token.role !== 'admin' && decoded_token.role !== 'agendador' && decoded_token.role !== "asignador") throw new Error('Unauthorized.');

    const services = await getEnterpriseServices({ sort });

    const channel = new BroadcastChannel('global-services');

    const stream = new ReadableStream({
      start: (controller) => {
        const data = {
          action: 'inital',
          services,
        }
        const firstdata = `data: ${JSON.stringify(data)}\n\n`;
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

  } catch (error) {
    response.body = { error: error.toString() };
  }
}