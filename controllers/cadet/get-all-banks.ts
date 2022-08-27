import { Context, verifyJwt } from '../../deps.ts';
import db from '../../utils/db.ts';
import { privateKey } from '../../constants.ts';
import { ServiceSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts';
import { getIntervals } from '../../utils/get-intervals.ts';
import { populateServiceOptions } from '../../constants.ts'

export const getCadetsBanksGrouped = async ({ response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get('untkca', { signed: true });

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

    // If user role is not scheduler, then return error
    if (role !== 'asignador') throw new Error('You do not have permission to access this resource.');

    // if user is a scheduler, continue...
    const model = db.collection<ServiceSchema>('services');

    const { first_date } = getIntervals();

    const banks = await model.aggregate([
      {
        $match: {
          $and: [
            { collect_money: true },
            { date_of_service: { $lte: first_date } },
            { return_collected_money_to: { $exists: true } },
          ]
        }
      },
      ...populateServiceOptions,
      {
        $group: {
          _id: '$return_collected_money_to',
          services: { $push: '$$ROOT' },
          collect_money_total_amount: {
            $sum: '$collect_money_amount'
          },
        }
      },
      {
        $sort: { collect_money_total_amount: -1 },
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
