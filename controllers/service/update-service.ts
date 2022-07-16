import { TokenData } from "../controllers.types.d.ts"
import { RouterContext, verifyJwt, Bson } from "../../deps.ts";
import { ServiceSchema } from "../../types.d.ts";
import { privateKey } from "../../constants.ts"
import db from "../../utils/db.ts";

export const updateService = async ({ request, response, cookies, params }: RouterContext<"/services/:id">) => {
  // gettinf the token from the cookies
  const token = await cookies.get('untkad', { signed: true });

  // setting response status and content type
  response.status = 401;
  response.type = "application/json";

  try {
    // if there is no token, throw an error
    if (!token) throw new Error("No token found");

    // Decoding the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // is role is not scheduler, throw an error
    if (payload.role !== "agendador") throw new Error("You are not authorized to perform this action");

    // getting the body of the request
    const body = await request.body({ type: 'json' }).value as ServiceSchema;

    // creating the object id's for inserted service
    const client_id = body.client_id ? new Bson.ObjectId(body.client_id) : undefined;
    const date_of_service = body.date_of_service ? new Date(body.date_of_service) : undefined;
    const delivered_by = body.delivered_by ? new Bson.ObjectId(body.delivered_by) : undefined;
    const picked_up_by = body.picked_up_by ? new Bson.ObjectId(body.picked_up_by) : undefined;
    const return_collected_money_to = body.return_collected_money_to ? new Bson.ObjectId(body.return_collected_money_to) : undefined;
    const _id = new Bson.ObjectId(params.id);

    // insert the service into the database
    const model = db.collection<ServiceSchema>("services");
    const updated_service = await model.findAndModify({ _id }, { update: { $set: { ...body, client_id, date_of_service, delivered_by, picked_up_by, return_collected_money_to } }, new: true });
    console.log(updated_service)

    // if there is no service, throw an error
    if (!updated_service) throw new Error("Service not found");

    response.status = 201;
    response.body = { data: updated_service };
    return

  } catch (error) {
    // if there is an error, return it in response body
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
}