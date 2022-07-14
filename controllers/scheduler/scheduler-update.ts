import { Context, signJwt, verifyJwt } from "../../deps.ts";
import db from "../../utils/db.ts";
import { privateKey, options } from "../../constants.ts";
import { SchedulerSchema } from "../../types.d.ts";

export const schedulerUpdate = async ({ request, response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untkad", { signed: true });

  // setting response to json and status code to 403
  response.type = "application/json";
  response.status = 403;

  try {
    // if request do not have cookies, return error
    if (!token) throw new Error("You do not have permission to access this resource.");

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as Partial<SchedulerSchema>;

    // If user role is not scheduler, then continue...
    if (payload.role !== "agendador") throw new Error("You do not have permission to access this resource.");

    // Taking the body of the request
    const data_to_update = await request.body({ type: "json" }).value as Partial<SchedulerSchema>;

    // if there is a password, username or email, delete it
    delete data_to_update.password;
    delete data_to_update.username;
    delete data_to_update.email;

    // connecting to DB and updating data
    const scheduler = db.collection<SchedulerSchema>("schedulers");
    const scheduler_updated = await scheduler.updateOne(
      { username: payload.username },
      { $set: { ...data_to_update } }
    );

    // if scheduler does not exist, return error
    if (!scheduler_updated.modifiedCount) {
      throw new Error("No data found.");
    }

    // if scheduler is updated, return new scheduler data...
    const new_scheduler = await scheduler.findOne({ username: payload.username }) as SchedulerSchema;

    const jwt_data = {
      role: new_scheduler.role,
      _id: new_scheduler._id,
      isLoggedIn: true,
    }

    // If everything is fine, create a new token and return the new data
    const new_token = await new signJwt(jwt_data).setProtectedHeader({ alg: "HS256" }).sign(privateKey)

    /*
      PARA MAÑANA:
        - Crear un endpoint para cambiar el usuario.
        - Crear un endpoint para cambiar el email.
        - Crear un endpoint para cambiar el password.
    */

    // If everything is ok, return the new data
    response.status = 200;
    response.body = { data: new_scheduler };
    await cookies.set("untkad", new_token, options);
    return;

  } catch (error) {
    // If token is not valid, return error
    if (error instanceof Error) {
      return response.body = { error: error.message };
    }

    return response.body = { error: "Something went wrong." };
  }
};
