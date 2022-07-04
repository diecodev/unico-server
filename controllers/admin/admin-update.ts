import db from "../../utils/db.ts";
import { AdminSchema } from "../../types.d.ts";
import { privateKey, options } from "../../constants.ts";
import { Context, signJwt, verifyJwt } from "../../deps.ts";

export const adminUpdate = async ({ request, response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untk");

  // setting response type to json and error status to 403
  response.type = "application/json";
  response.status = 403;

  try {
    // If cookie is not found, return error
    if (!token) {
      throw new Error("You do not have permission to access this resource.");
    }

    // If request do not have body, return error
    if (!request.hasBody) throw new Error("No data provided.");

    // getting the body of the request
    const data_to_update = await request.body({ type: "json" }).value as Partial<AdminSchema>;

    // Verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as Partial<AdminSchema>;

    // if user is not admin, return error
    if (payload.role !== "admin") throw new Error("You do not have permission execute this action.");

    if (data_to_update.password || data_to_update.username || data_to_update.email) {
      delete data_to_update.password;
      delete data_to_update.username;
      delete data_to_update.email;
    }

    // Connecting to DB and updating data
    const admin = db.collection<AdminSchema>("admins");
    const admin_updated = await admin.updateOne(
      { username: payload.username },
      { $set: { ...data_to_update } },
    );

    // If admin does not exist, return error
    if (!admin_updated.modifiedCount) throw new Error("No data found.");

    // If admin is updated, return new admin data...
    const new_admin = await admin.findOne({ username: payload.username });

    // If everything is fine, create a new token and return the new data
    const new_token = await new signJwt({ ...new_admin }).setProtectedHeader({ alg: "HS256" }).sign(privateKey)

    /*
      PARA MAÑANA:
        - Crear un endpoint para cambiar el usuario.
        - Crear un endpoint para cambiar el email.
        - Crear un endpoint para cambiar el password.
    */

    // If everything is ok, return the new data
    response.status = 200;
    response.body = { data: new_admin };
    cookies.set("untk", new_token, options);
    return;
  } catch (error) {
    // If there is an error, return error
    if (error instanceof Error) {
      return response.body = { error: error.message };
    }

    return response.body = { error: "Something went wrong." };
  }
};
