import { Bson } from "./deps.ts";

// admin, asignador, agendador, cadete, cliente
type Role = "admin" | "allocator" | "scheduler" | "cadet" | "client";

export interface AdminSchema {
  _id: Bson.ObjectId;
  role: Role;
  name: string;
  last_name: string;
  username: string;
  password: string;
  profile_picture: string;
  email: string;
  balance: number;
}

export interface AssistantSchema extends Omit<AdminSchema, "role"> {
  role: Role;
  direction: string;
  phone: string;
  profilePic: string;
  isActive: boolean;
}

export interface Cadet extends Omit<AssistantSchema, "role"> {
  role: Role;
  dni: string;
  patent: string;
  dniFrontPic: string;
  dniBackPic: string;
  vehiclePic: string;
}
