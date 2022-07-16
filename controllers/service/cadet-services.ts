import { RouterContext, verifyJwt, Bson } from "../../deps.ts";
import { TokenData } from "../controllers.types.d.ts"
import { ServiceSchema } from "../../types.d.ts";
import { privateKey } from "../../constants.ts";
import { getIntervals } from "../../utils/get-intervals.ts"
import db from "../../utils/db.ts";

export const cadetsServices = async ({ response, params, cookies }: RouterContext<"/services/cadet/:id/:sort">) => {
  const { sort } = params;
  const id = new Bson.ObjectId(params.id);

  const token = await cookies.get('untkca', { signed: true });

  //setting the response type and status.
  response.status = 401;
  response.type = "application/json";
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
      { $match: { date_of_service: { $gte: sort === 'asc' ? first_date : last_date, $lte: sort === 'asc' ? last_date : first_date }, $or: [{ picked_up_by: id }, { delivered_by: id }] } },
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
    response.body = {
      data: services,
    };
    return;

  } catch (error) {
    // if error exist, then return it
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}