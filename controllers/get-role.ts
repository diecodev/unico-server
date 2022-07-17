import { RouterContext, verifyJwt } from '../deps.ts';
import db from '../utils/db.ts';
import { privateKey } from '../constants.ts';
import { AdminSchema } from '../types.d.ts';
import { TokenData } from './controllers.types.d.ts';

export const getRole = async ({ response, cookies, params }: RouterContext<'/unico/employees/:role'>) => {
  // Taking the cookie
  const token = await cookies.get('untkad', { signed: true });

  // setting the response status and response type
  response.status = 401;
  response.type = 'application/json';

  const required_role = params.role;

  try {
    // if request do not have cookies, return error
    if (!token) throw new Error('You do not have permission to access this resource.');

    // if required role is different than scheduler, cadets or clients, then return error
    if (required_role !== 'schedulers' && required_role !== 'cadets' && required_role !== 'clients') {
      response.status = 404;
      return;
    }

    // verifying the token
    const { role, _id, isLoggedIn } = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if user is not logged in, return error
    if (!isLoggedIn) throw new Error('You do not have permission to access this resource.');

    // If user role is admin, or scheduler, then continue...
    if (role === 'admin' || role === 'agendador') {

      // connecting to DB and consulting data
      const user = db.collection<AdminSchema>(required_role);
      const user_data = await user.find({}, { projection: { password: 0 } }).toArray() as Partial<AdminSchema>;

      // Deleting password for admin
      delete user_data.password;

      // returning the data
      response.status = 200;
      response.body = { data: user_data };
      return;
    }

    // If user role is not admin, allocator or cadet, then return error
    throw new Error('You do not have permission to access this resource.');

    // If token is not valid, return error
  } catch (error) {
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
};
