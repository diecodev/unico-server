import { Context } from "../deps.ts";

export const logout = (context: Context) => {
  context.cookies.set("untk", "", {
    expires: new Date(Date.now() - 1),
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });
  context.response.body = {
    message: "Logged out successfull",
  };
};
