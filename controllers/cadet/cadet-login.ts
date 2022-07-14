import { bcrypt, Context, signJwt } from "../../deps.ts";
import db from "../../utils/db.ts";
import { privateKey, options } from "../../constants.ts";
import { CadetSchema } from "../../types.d.ts";
import { LoginRequest } from "../controllers.types.d.ts";

export const cadetLogin = async ({ request, response, cookies }: Context) => {
  // setting response type to json and error status to 401
  response.status = 401;
  response.type = "application/json";

  try {
    // if body is empty, return error
    if (!request.hasBody) throw new Error("No data provided.")

    // getting the body of the request
    const { username, password } = (await request.body({ type: "json" }).value) as LoginRequest;

    // if body does not contain username or password, return error
    if (!username || !password) throw new Error("Please, check your credentials.")

    // connecting to DB and consulting data
    const cadet = db.collection<CadetSchema>("cadets");
    const cadet_found: Partial<CadetSchema> | undefined = await cadet.findOne({ username });

    // if cadet does not exist, return error
    if (!cadet_found) throw new Error("Please, check your credentials.");

    // comparing the password
    const is_password_correct = bcrypt.compareSync(password, cadet_found.password as string);

    // if password is incorrect, return error
    if (!is_password_correct) throw new Error("Please, check your credentials.");

    // not returning the password
    delete cadet_found.password;

    const jwt_data = {
      _id: cadet_found._id,
      role: cadet_found.role,
      isLoggedIn: true,
    }

    // creating the JWT
    const token = await new signJwt(jwt_data).setProtectedHeader({ alg: "HS256" }).sign(privateKey);

    response.status = 200;
    response.body = {
      data: cadet_found,
      isLoggedIn: true,
    };
    await cookies.set("untk", JSON.stringify(token), options);
    return;
  } catch (error) {
    // if login fails, return error
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: "Something went wrong." };
  }
};
