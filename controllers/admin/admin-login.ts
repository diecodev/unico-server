import { bcrypt, Context, signJwt } from "../../deps.ts";
import db from "../../utils/db.ts";
import { AdminSchema } from "../../types.d.ts";
import { privateKey, options } from "../../constants.ts";
import { LoginRequest } from "../controllers.types.d.ts";

export const adminLogin = async ({ request, response, cookies }: Context) => {
  // setting response type to json and error status to 401
  response.status = 401;
  response.type = "application/json";

  try {
    // If request do not have body, return error
    if (!request.hasBody) throw new Error("No data provided.")

    // getting the body of the request
    const { username, password } = await request.body({ type: "json" }).value as LoginRequest;

    // If body does not contain username or password, return error
    if (!username || !password) throw new Error("Please, check your credentials")

    // connecting to DB and consulting data
    const admin = db.collection<AdminSchema>("admins");
    const admin_found: Partial<AdminSchema> | undefined = await admin.findOne({ username });

    // If admin does not exist, return error
    if (!admin_found) throw new Error("Please, check your credentials")

    // comparing the password
    console.log("password incorrect")
    const is_password_correct = bcrypt.compareSync(password, admin_found.password as string);

    console.log("password correct")
    // If password is incorrect, return error
    if (!is_password_correct) throw new Error("Please, check your credentials.")

    // not returning the password
    delete admin_found.password;
    console.log("delete password")
    // creating the token
    const token = await new signJwt({ ...admin_found }).setProtectedHeader({ alg: "HS256" }).sign(privateKey);
    console.log("create token")
    response.status = 200;
    response.body = {
      data: admin_found,
      isLoggedIn: true,
    };
    cookies.set("untk", JSON.stringify(token), options);
    console.log("response and cookies");
    return;
  } catch (error) {
    // If login is not successful, return error
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: "Something went wrong." };
  }
};
