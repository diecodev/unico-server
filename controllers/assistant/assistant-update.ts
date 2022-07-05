import { Context, signJwt, verifyJwt } from "../../deps.ts";
import db from "../../utils/db.ts";
import { privateKey, options } from "../../constants.ts";
import { AssistantSchema } from "../../types.d.ts";

export const assistantUpdate = async ({ request, response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untk");

  // setting response to json and status code to 403
  response.type = "application/json";
  response.status = 403;

  try {
    // if request do not have cookies, return error
    if (!token) {
      throw new Error("You do not have permission to access this resource.");
    }

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as Partial<AssistantSchema>;

    // If user role is not allocator or scheduler, then continue...
    if (payload.role !== "asignador" && payload.role !== "agendador") {
      throw new Error("You do not have permission to access this resource.");
    }

    // Taking the body of the request
    const data_to_update = await request.body({ type: "json" }).value as Partial<AssistantSchema>;

    if (data_to_update.password || data_to_update.username || data_to_update.email) {
      delete data_to_update.password;
      delete data_to_update.username;
      delete data_to_update.email;
    }

    // connecting to DB and updating data
    const assistant = db.collection<AssistantSchema>("assistants");
    const assistant_updated = await assistant.updateOne(
      { username: payload.username },
      { $set: { ...data_to_update } }
    );

    // if assistant does not exist, return error
    if (!assistant_updated.modifiedCount) {
      throw new Error("No data found.");
    }

    // if assistant is updated, return new assistant data...
    const new_assistant = await assistant.findOne({ username: payload.username });

    // If everything is fine, create a new token and return the new data
    const new_token = await new signJwt({ ...new_assistant }).setProtectedHeader({ alg: "HS256" }).sign(privateKey)

    /*
      PARA MAÑANA:
        - Crear un endpoint para cambiar el usuario.
        - Crear un endpoint para cambiar el email.
        - Crear un endpoint para cambiar el password.
    */

    // If everything is ok, return the new data
    response.status = 200;
    response.body = { data: new_assistant };
    cookies.set("untk", new_token, options);
    return;

  } catch (error) {
    // If token is not valid, return error
    if (error instanceof Error) {
      return response.body = { error: error.message };
    }

    return response.body = { error: "Something went wrong." };
  }
};
