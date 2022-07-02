import { Context, dotEnv } from "../../deps.ts";
import db from "../../utils/db.ts";

interface AdminRequest {
  username: string;
  password: string;
}

export const adminLogin = async ({ request, response, cookies }: Context) => {
  if (!request.hasBody) {
    response.status = 400;
    response.body = { message: "Invalid data" };
    return;
  }

  const { username, password } = await request.body({
    type: "json",
  }).value as AdminRequest;

  console.log({ password })

  const admin = db.collection("admins");
  const admin_found = await admin.findOne({ username });

  if (admin_found) {
    response.status = 200;
    response.body = admin_found;
    response.type = "application/json";
    cookies.set("untk", JSON.stringify(admin_found), {
      domain: "localhost",
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      // secure: true,
    });
  }
}