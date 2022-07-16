import type { SchedulerSchema, CadetSchema, ClientSchema } from "../types.d.ts";
import { isAnScheduler, isAnCadet, isAnClient } from "../utils/interfaces-validator.ts"
import { insertScheduler, insertClient, insertCadet } from "../utils/insert-users.ts"
import { RouterContext, verifyJwt } from "../deps.ts";
import { TokenData } from "./controllers.types.d.ts"
import { privateKey } from "../constants.ts";

export const adminRegisterUsers = async ({ request, response, cookies, params }: RouterContext<"/unico/register/:role">) => {
  // taking the url from request and the token from cookies
  const token = await cookies.get("untkad", { signed: true });

  // taking the role that is required to register
  const role_to_register = params.role;

  // setting response type and status code
  response.type = "application/json";
  response.status = 401;

  try {
    // if there is not token or user to register is not assistant, cadeet or client, throw an error.
    if (!token) throw new Error("You do not have permission to access this resource.");

    // verifying the token an taking the user role
    const { role, isLoggedIn } = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if role is different than admin, allocator or scheduler throw an error.
    if ((role !== "admin" && role !== "agendador") || !isLoggedIn) throw new Error("You do not have permission to access this resource.");

    // taking the body object
    const data: SchedulerSchema | CadetSchema | ClientSchema = await request.body({ type: "json" }).value;

    /*
      Verifying the type of data, if it is an assistant, cadet or client,
      then we will insert the data in the database, if the verification does not fails,
    */

    switch (role_to_register) {
      case "schedulers": {
        // verifying the assistant schema fields
        const is_true = isAnScheduler(data);

        // verifying the data on request is with assistants (allocator or scheduler) role
        const is_scheduler = data.role === "agendador";

        // if the verification fails, throw an error.
        if (!is_true || !is_scheduler) throw new Error("The data is not valid.");

        // insert the data in the database
        const new_scheduler = await insertScheduler(data);

        // return the data
        response.status = 201;
        response.body = {
          data: new_scheduler,
        }
        return;
      }

      case "cadets": {
        // verifying the cadet schema fields
        const is_true = isAnCadet(data);

        // verifying the data on request is with cadet role
        const is_cadet = data.role === "cadete" || data.role === 'asignador';

        // if the verification fails, throw an error.
        if (!is_true || !is_cadet) throw new Error("The data is not valid.");

        // insert the data in the database
        const new_cadet = await insertCadet(data);

        // return the data
        response.status = 201;
        response.body = {
          data: new_cadet,
        }
        return;
      }

      case "clients": {
        // verifying the cadet schema fields
        const is_true = isAnClient(data);

        // verifying the data on request is with cadet role
        const is_client = data.role === "cliente";

        // if the verification fails, throw an error.
        if (!is_true || !is_client) throw new Error("The data is not valid.");

        // insert the data in the database
        const new_client = await insertClient(data);

        // return the data
        response.status = 201;
        response.body = {
          data: new_client,
        }
        return;
      }

      default: throw new Error("You do not have permission to access this resource.");
    }

  } catch (error) {
    // if error, return error
    if (error instanceof Error) return response.body = { error: error.message }

    return response.body = { error: error.toString() }
  }
}
