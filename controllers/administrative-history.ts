import { Context, verifyJwt } from '../deps.ts';
import db from '../utils/db.ts';
import { privateKey } from '../constants.ts';
import { ServiceSchema } from '../types.d.ts';
import { TokenData } from './controllers.types.d.ts';
import { getIntervals } from '../utils/get-intervals.ts';
import { populateServiceOptions } from '../constants.ts'

export const administrativeHistory = async ({ response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get('untkad', { signed: true }) || await cookies.get('untkca', { signed: true });

  // setting the response status and response type
  response.status = 401;
  response.type = 'application/json';

  try {
    // if request do not have cookies, return error
    if (!token) throw new Error('You do not have permission to access this resource.');

    // verifying the token
    const { role, isLoggedIn } = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if user is not logged in, return error
    if (!isLoggedIn) throw new Error('You do not have permission to access this resource.');

    // If user role is not allocator or cadet, then return error
    if (role !== 'asignador' && role !== 'agendador' && role !== 'admin') throw new Error('You do not have permission to access this resource.');

    // if user is a allocator or cadet, continue...
    const model = db.collection<ServiceSchema>('services');

    const { first_date } = getIntervals();

    //mongodb query
    const banks = await model.aggregate([
      {
        $match: {
          date_of_service: { $lt: first_date },
        }
      },
      ...populateServiceOptions,
      {
        $group: {
          _id: '$date_of_service',
          data: { $push: '$$ROOT' },
        }
      },
      {
        $sort: { _id: -1 },
        $limit: 1000,
      },
    ]).toArray();

    response.status = 200;
    response.body = { data: banks };
    return;
  } catch (error) {
    // If token is not valid, return error
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
};
