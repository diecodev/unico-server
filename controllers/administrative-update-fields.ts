import { RouterContext, Bson } from "../deps.ts";
import { CadetSchema, SchedulerSchema, ClientSchema } from "../types.d.ts";
import { updateUser } from "../utils/update-users.ts";

export const administrativeUpdateFields = async ({ request, params, response, cookies }: RouterContext<'/unico/update/:role/:id'>) => {
  // getting the token from cookies
  const token = await cookies.get("untkad", { signed: true });

  // getting role and id from params
  const { role } = params;
  const id = new Bson.ObjectId(params.id);

  //setting response status and type
  response.status = 401;
  response.type = 'application/json';

  try {
    // if there is not token, body or role is not valid, return error
    if (!token) throw new Error("No token provided");

    if (!request.hasBody) throw new Error("No body provided");

    if (role !== 'agendador' && role !== 'asignador' && role !== 'cadete' && role !== 'cliente') throw new Error("Unauthorized");

    // getting the body from the request
    const body: CadetSchema | SchedulerSchema | ClientSchema = await request.body().value;

    let updated_user: CadetSchema | SchedulerSchema | ClientSchema;

    // update user based on role
    switch (role) {
      case "agendador": {
        const updated_scheduler = await updateUser({ model: 'schedulers', body, id });

        if (!updated_scheduler) throw new Error("Invalid data");

        updated_user = updated_scheduler;
        break;
      }

      case "asignador": case "cadete": {
        const updated_cadet = await updateUser({ model: "cadets", body, id });

        if (!updated_cadet) throw new Error("Invalid data");

        updated_user = updated_cadet;
        break;
      }

      case "cliente": {
        const updated_client = await updateUser({ model: "clients", body, id });

        if (!updated_client) throw new Error("Invalid data");

        updated_user = updated_client;
        break;
      }

      default: throw new Error("Unauthorized");
    }

    // setting response status and body
    response.status = 200;
    response.body = {
      data: updated_user,
    }
    return;

  } catch (error) {
    // If there is an error, return it to the user
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }

}