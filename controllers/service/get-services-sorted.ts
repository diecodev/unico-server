import type { AdminSchema, ServiceSchema } from '../../types.d.ts';
import db from '../../utils/db.ts'
import { RouterContext, verifyJwt } from '../../deps.ts';
import { privateKey } from '../../constants.ts';
import { getIntervals } from "../../utils/get-intervals.ts";

export const getServicesSorted = async ({ cookies, response, params }: RouterContext<"/services/:sort">) => {
  const token = await cookies.get('untkad', { signed: true });

  response.status = 401;
  response.type = 'application/json';

  const { sort } = params;

  const { first_date, last_date } = getIntervals(sort === 'asc');

  try {
    if (!token || (sort !== 'asc' && sort !== 'desc')) throw new Error('Unauthorized.');

    const decoded_token = (await verifyJwt(token, privateKey)).payload as unknown as AdminSchema;

    if (decoded_token.role !== 'admin' && decoded_token.role !== 'agendador') throw new Error('Unauthorized.');

    const service_model = db.collection<ServiceSchema>('services');

    const services = await service_model.aggregate([
      { $match: { date_of_service: { $gte: sort === 'asc' ? first_date : last_date, $lte: sort === 'asc' ? last_date : first_date } } },
      { $sort: { date_of_service: sort === 'asc' ? 1 : -1 } },
      {
        $lookup: {
          from: 'cadets',
          localField: 'picked_up_by',
          foreignField: '_id',
          as: 'picked_up_by'
        }
      },
      {
        $lookup: {
          from: 'cadets',
          localField: 'delivered_by',
          foreignField: '_id',
          as: 'delivered_by'
        }
      },
      {
        $unset: [
          "delivered_by.password",
          "delivered_by.email",
          "delivered_by.username",
          "delivered_by.profile_picture",
          "delivered_by.balance",
          "delivered_by.address",
          "delivered_by.phone",
          "delivered_by.is_active",
          "delivered_by.dni",
          "delivered_by.patent",
          "delivered_by.dni_frontal_picture",
          "delivered_by.dni_back_picture",
          "delivered_by.vehicle_picture",

          "picked_up_by.password",
          "picked_up_by.email",
          "picked_up_by.username",
          "picked_up_by.profile_picture",
          "picked_up_by.balance",
          "picked_up_by.address",
          "picked_up_by.phone",
          "picked_up_by.is_active",
          "picked_up_by.dni",
          "picked_up_by.patent",
          "picked_up_by.dni_frontal_picture",
          "picked_up_by.dni_back_picture",
          "picked_up_by.vehicle_picture",
        ]
      },
      {
        $unwind: {
          path: '$picked_up_by',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$delivered_by',
          preserveNullAndEmptyArrays: true
        }
      },
    ]).toArray();

    response.status = 200;
    response.body = { data: services };

  } catch (error) {
    response.body = { error: error.toString() };
  }
}