import { Bson } from "./deps.ts";

// admin, allocator, scheduler, cadet, client
export type Role = "admin" | "asignador" | "agendador" | "cadete" | "cliente";
export type PaymentMethod = "Efectivo" | "Transferencia";
export type Schedule = {
  start_time: string;
  end_time: string;
};

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

export interface AssistantSchema extends AdminSchema {
  address: string;
  phone: string;
  is_active: boolean;
}

export interface CadetSchema extends AssistantSchema {
  dni: string;
  patent: string;
  dni_frontal_picture: string;
  dni_back_picture: string;
  vehicle_picture: string;
}

export interface ClientSchema extends Omit<AssistantSchema, "email"> {
  payment_method: PaymentMethod;
  schedule?: Schedule;
  enterprise?: string;
  employee_name?: string;
  email?: string;
}
