import { RouterContext, verifyJwt, Bson } from '../deps.ts';
import db from '../utils/db.ts';
import { privateKey } from '../constants.ts';
import { AdminSchema } from '../types.d.ts';
import { TokenData } from './controllers.types.d.ts';

export const updateBalance = async ({ request, response, cookies, params }: RouterContext<'/unico/balance/:role/:sort'>) => {
  // Taking the cookie
  const token = await cookies.get('untkad', { signed: true });

  // setting the response status and response type
  response.status = 401;
  response.type = 'application/json';

  try {
    // if request do not have cookies, return error
    if (!token || (params.role !== 'admins' && params.role !== 'schedulers' && params.role !== 'cadets' && params.role !== 'clients')) throw new Error('You do not have permission to access this resource.');

    const body = await request.body({ type: 'json' }).value as AdminSchema;

    const _id = new Bson.ObjectId(body._id);

    // verifying the token
    const { role, isLoggedIn } = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if user is not logged in, return error
    if (!isLoggedIn) throw new Error('You do not have permission to access this resource.');

    // If user role is admin, or scheduler, then continue...
    if (role === 'asignador') throw new Error('You do not have permission to access this resource.');

    const model = db.collection(params.role);
    const user = await model.findAndModify({ _id }, { update: { $inc: { balance: params.sort === 'inc' ? body.balance : -body.balance } }, new: true });

    // if user is not found, return error
    if (!user) throw new Error('User not found');

    response.status = 200;
    response.body = { data: user };
    return;
  } catch (error) {
    // If token is not valid, return error
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
};
