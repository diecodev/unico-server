import { Context, verifyJwt } from "../deps.ts";
import db from "../utils/db.ts";
import { privateKey } from "../constants.ts";
import { AdminSchema } from "../types.d.ts";

export const administrativeLogin = async ({ response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untk");

  // setting the response status and response type
  response.status = 401;
  response.type = "application/json";

  try {
    // if request do not have cookies, return error
    if (!token) {
      throw new Error("You do not have permission to access this resource.");
    }

    // verifying the token
    const { role, username } = (await verifyJwt(token, privateKey)).payload as unknown as Partial<AdminSchema>;

    // If user role is admin, allocator or cadet, then continue...
    if (role === "admin" || role === "asignador" || role === "agendador") {
      const collection: string = role === "admin" ? "admins" : "assistants";

      // connecting to DB and consulting data
      const user = db.collection<AdminSchema>(collection);
      const user_data = await user.findOne({
        username: username,
      }) as Partial<AdminSchema>;

      // Deleting password for admin
      delete user_data.password;

      // returning the data
      response.status = 200;
      response.body = { data: user_data };
      return;
    }

    // If user role is not admin, allocator or cadet, then return error

    throw new Error("You do not have permission to access this resource.");

    // If token is not valid, return error
  } catch (error) {
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
};
