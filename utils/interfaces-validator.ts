import { AssistantSchema, CadetSchema, ClientSchema } from "../types.d.ts";

// deno-lint-ignore no-explicit-any
export const isAnAssistant = (data: any): data is AssistantSchema => {
  return "role" in data && "name" in data && "last_name" in data && "username" in data && "password" in data && "profile_picture" in data && "email" in data && "balance" in data && "address" in data && "phone" in data && "is_active" in data;
};

// deno-lint-ignore no-explicit-any
export const isAnCadet = (data: any): data is CadetSchema => {
  return "role" in data && "name" in data && "last_name" in data && "username" in data && "password" in data && "profile_picture" in data && "email" in data && "balance" in data && "address" in data && "phone" in data && "is_active" in data && "dni" in data && "patent" in data && "dni_frontal_picture" in data && "dni_back_picture" in data && "vehicle_picture" in data;
};

// deno-lint-ignore no-explicit-any
export const isAnClient = (data: any): data is ClientSchema => {
  return "role" in data && "name" in data && "last_name" in data && "username" in data && "password" in data && "profile_picture" in data && "balance" in data && "address" in data && "phone" in data && "is_active" in data && "payment_method" in data;
};