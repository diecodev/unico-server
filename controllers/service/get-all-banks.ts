import { Context, verifyJwt } from '../../deps.ts';
import db from '../../utils/db.ts';
import { privateKey } from '../../constants.ts';
import { ServiceSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts';

export const getAllBanks = async ({ response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get('untkad', { signed: true });

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
    if (role !== 'agendador' && role !== 'admin') throw new Error('You do not have permission to access this resource.');

    // if user is a scheduler, continue...
    const model = db.collection<ServiceSchema>('services');

    const date = new Date();
    const new_date = date.toLocaleString('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })

    const banks = await model.aggregate([
      {
        $match: {
          $and: [
            { collect_money: true },
            { date_of_service: { $lte: new_date } }
          ]
        }
      },
      {
        $sort: { date_of_service: -1 },
      },
      {
        $lookup: {
          from: 'cadets',
          localField: 'return_collected_money_to',
          foreignField: '_id',
          as: 'return_collected_money_to',
        }
      },
      {
        $unwind: {
          path: '$return_collected_money_to',
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $unset: [
          'return_collected_money_to.password',
          'return_collected_money_to.email',
          'return_collected_money_to.username',
          'return_collected_money_to.profile_picture',
          'return_collected_money_to.balance',
          'return_collected_money_to.address',
          'return_collected_money_to.phone',
          'return_collected_money_to.is_active',
          'return_collected_money_to.dni',
          'return_collected_money_to.patent',
          'return_collected_money_to.dni_frontal_picture',
          'return_collected_money_to.dni_back_picture',
          'return_collected_money_to.vehicle_picture',
        ]
      }
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
