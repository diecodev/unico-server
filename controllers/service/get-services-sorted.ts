import type { AdminSchema } from '../../types.d.ts';
import { RouterContext, verifyJwt } from '../../deps.ts';
import { privateKey } from '../../constants.ts';
import { getEnterpriseServices } from '../../utils/get-enterprise-services.ts';

export const getServicesSorted = async (ctx: RouterContext<'/services/:sort'>) => {
  const { cookies, response, params } = ctx;

  // taking admin or allocator cookie
  const token = await cookies.get('untkad', { signed: true }) || await cookies.get('untkca', { signed: true })

  response.status = 401;
  response.type = 'application/json';

  const { sort } = params;

  try {
    if (!token || (sort !== 'asc' && sort !== 'desc')) throw new Error('Unauthorized.');
    if (!ctx.isUpgradable) throw new Error('Unauthorized.');

    const decoded_token = (await verifyJwt(token, privateKey)).payload as unknown as AdminSchema;

    if (decoded_token.role !== 'admin' && decoded_token.role !== 'agendador' && decoded_token.role !== "asignador") throw new Error('Unauthorized.');

    const services = await getEnterpriseServices({ sort });

    const channel = new BroadcastChannel('global-services');

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

  } catch (error) {
    response.body = { error: error.toString() };
  }
}