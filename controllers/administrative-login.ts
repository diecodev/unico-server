import { Context, verifyJwt } from "../deps.ts";
import db from "../utils/db.ts";
import { privateKey } from "../constants.ts";
import { AdminSchema } from "../types.d.ts";

export const administrativeLogin = async ({ response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untk");

  // if request do not have cookies, return error
  if (!token) {
    response.status = 401;
    response.body = {
      error: "You do not have permission to access this resource.",
    };
    return;
  }

  // verifying the token
  try {
    const payload = (await verifyJwt(token, privateKey))
      .payload as unknown as Partial<AdminSchema>;

    // If user role is admin, allocator or cadet, then continue...
    if (
      payload.role === "admin" || payload.role === "allocator" ||
      payload.role === "cadet"
    ) {
      const collection: string = payload.role === "admin"
        ? "admins"
        : "assistants";

      // connecting to DB and consulting data
      const user = db.collection<AdminSchema>(collection);
      const user_data = await user.findOne({
        username: payload.username,
      }) as Partial<AdminSchema>;

      // Deleting password for admin
      delete user_data.password;

      // returning the data
      response.status = 200;
      response.body = {
        data: user_data,
      };
      return;
    }

    // If user role is not admin, allocator or cadet, then return error
    response.status = 401;
    response.body = {
      error: "You do not have permission to access this resource.",
    };
    return;
  } catch (_error) {
    // If token is not valid, return error
    response.status = 401;
    response.body = { error: "Invalid token." };
    return;
  }
};
