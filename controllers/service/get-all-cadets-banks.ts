import { RouterContext, verifyJwt, Bson } from '../../deps.ts';
import db from '../../utils/db.ts';
import { privateKey, populateServiceOptions } from '../../constants.ts';
import { ServiceSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts';
import { getIntervals } from '../../utils/get-intervals.ts';

export const getAllCadetsBanks = async ({ response, cookies, params }: RouterContext<'/services/banks/:id'>) => {
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

    // if user is not logged in or user role is not cadet, return error
    if (!isLoggedIn || (role !== 'cadete' && role !== 'asignador')) throw new Error('You do not have permission to access this resource.');

    // if user is a scheduler, continue...
    const model = db.collection<ServiceSchema>('services');

    const { first_date } = getIntervals();

    const id = new Bson.ObjectId(params.id);

    const banks = await model.aggregate([
      {
        $match: {
          $and: [{ collect_money: true }, { date_of_service: { $lte: new Date(first_date) } }, { $or: [{ delivered_by: id }, { picked_up_by: id }] }]
        }
      },
      ...populateServiceOptions,
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
