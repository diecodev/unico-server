import type { AdminSchema, AssistantSchema, CadetSchema, ClientSchema } from "../types.d.ts";
import { isAnAssistant, isAnCadet, isAnClient } from "../utils/interfaces-validator.ts"
import { insertAssistant, insertClient, insertCadet } from "../utils/insert-users.ts"
import { Context, verifyJwt } from "../deps.ts";
import { privateKey } from "../constants.ts";

export const adminRegisterUsers = async ({ request, response, cookies }: Context) => {
  // taking the url from request and the token from cookies
  const url = new URL(String(request.url));
  const token = await cookies.get("untk");

  // taking the role that is required to register
  const role_to_register = url.pathname.split("/")[2];

  // setting response type and status code
  response.type = "application/json";
  response.status = 401;

  try {
    // if there is not token or user to register is not assistant, cadeet or client, throw an error.
    if (!token) throw new Error("You do not have permission to access this resource.");

    // verifying the token an taking the user role
    const { role } = (await verifyJwt(token, privateKey)).payload as unknown as AdminSchema;

    // if role is different than admin, allocator or scheduler throw an error.
    if (role !== "admin" && role !== "asignador" && role !== "agendador") throw new Error("You do not have permission to access this resource.");

    // taking the body object
    const data: AssistantSchema | CadetSchema | ClientSchema = await request.body({ type: "json" }).value;

    /*
      Verifying the type of data, if it is an assistant, cadet or client,
      then we will insert the data in the database, if the verification does not fails,
    */

    switch (role_to_register) {
      case "assistants": {
        // verifying the assistant schema fields
        const is_true = isAnAssistant(data);

        // verifying the data on request is with assistants (allocator or scheduler) role
        const is_assistant = data.role === "agendador" || data.role === "asignador";

        // if the verification fails, throw an error.
        if (!is_true || !is_assistant) throw new Error("The data is not valid.");

        // insert the data in the database
        const new_assistant = await insertAssistant(data);

        // return the data
        response.status = 201;
        response.body = {
          data: new_assistant,
        }
        return;
      }

      case "cadets": {
        // verifying the cadet schema fields
        const is_true = isAnCadet(data);

        // verifying the data on request is with cadet role
        const is_cadet = data.role === "cadete";

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
