import { Context, signJwt, verifyJwt } from "../../deps.ts";
import db from "../../utils/db.ts";
import { privateKey, options } from "../../constants.ts";
import { CadetSchema } from "../../types.d.ts";

export const cadetUpdate = async ({ request, response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get("untkca", { signed: true });

  // setting response to json and status code to 403
  response.type = "application/json";
  response.status = 403;

  try {
    // if request do not have cookies, return error
    if (!token) throw new Error("You do not have permission to access this resource.");

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as Partial<CadetSchema>;

    // If user role is not allocator or scheduler, then continue...
    if (payload.role !== "cadete") throw new Error("You do not have permission to access this resource.");

    // Taking the body of the request
    const data_to_update = await request.body({ type: "json" }).value as Partial<CadetSchema>;

    delete data_to_update.password;
    delete data_to_update.username;
    delete data_to_update.email;

    // connecting to DB and updating data
    const cadet = db.collection<CadetSchema>("cadets");
    const cadet_updated = await cadet.updateOne(
      { username: payload.username },
      { $set: { ...data_to_update } }
    );

    // if cadet does not exist, return error
    if (!cadet_updated.modifiedCount) throw new Error("No data found.");

    // if cadet is updated, return new cadet data...
    const new_cadet = await cadet.findOne({ username: payload.username });

    // If everything is fine, create a new token and return the new data
    const new_token = await new signJwt({ ...new_cadet }).setProtectedHeader({ alg: "HS256" }).sign(privateKey);

    // If everything is ok, return the new data
    response.status = 200;
    response.body = { data: new_cadet };
    await cookies.set("untk", new_token, options);
    return;

  } catch (error) {
    // If token is not valid, return error
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: "Something went wrong." };
  }
};
