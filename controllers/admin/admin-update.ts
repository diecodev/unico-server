import db from "../../utils/db.ts";
import { AdminSchema } from "../../types.d.ts";
import { privateKey, options } from "../../constants.ts";
import { Context, signJwt, verifyJwt } from "../../deps.ts";
import { TokenData } from "../controllers.types.d.ts";

export const adminUpdate = async ({ request, response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untkad", { signed: true });

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
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if user is not admin, return error
    if (payload.role !== "admin" || !payload.isLoggedIn) throw new Error("You do not have permission execute this action.");

    delete data_to_update.password;
    delete data_to_update.username;
    delete data_to_update.email;

    // Connecting to DB and updating data
    const admin = db.collection<AdminSchema>("admins");
    const admin_updated = await admin.updateOne(
      { _id: payload._id },
      { $set: { ...data_to_update } },
    );

    // If admin does not exist, return error
    if (!admin_updated.modifiedCount) throw new Error("No data found.");

    // If admin is updated, return new admin data...
    const new_admin = await admin.findOne({ _id: payload._id }) as AdminSchema;

    const jwt_data = {
      role: new_admin.role,
      _id: new_admin._id,
      isLoggedIn: true,
    }

    // If everything is fine, create a new token and return the new data
    const new_token = await new signJwt(jwt_data).setProtectedHeader({ alg: "HS256" }).sign(privateKey);

    // If everything is ok, return the new data
    response.status = 200;
    response.body = { data: new_admin };
    await cookies.set("untkad", new_token, options);
    return;
  } catch (error) {
    // If there is an error, return error
    if (error instanceof Error) {
      return response.body = { error: error.message };
    }

    return response.body = { error: "Something went wrong." };
  }
};
