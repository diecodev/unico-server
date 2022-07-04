import { Context } from "../deps.ts";

export const logout = async (context: Context) => {
  if (!(await context.cookies.get("untk"))) {
    context.response.status = 401;
    context.response.body = {
      meesage: "You do not have permission to access this resource.",
    };
    return;
  }
  context.cookies.set("untk", "", {
    maxAge: -1,
    path: "/",
  });
  context.response.body = {
    message: "Logged out successfull.",
    data: {},
    isLoggedIn: false,
  };
  return;
};
