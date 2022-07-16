import { SchedulerSchema, CadetSchema, ClientSchema, ServiceSchema } from '../types.d.ts';

// deno-lint-ignore no-explicit-any
export const isAnScheduler = (data: any): data is SchedulerSchema => {
  return 'role' in data && 'name' in data && 'last_name' in data && 'username' in data && 'password' in data && 'profile_picture' in data && 'email' in data && 'balance' in data && 'address' in data && 'phone' in data && 'is_active' in data;
};

// deno-lint-ignore no-explicit-any
export const isAnCadet = (data: any): data is CadetSchema => {
  return 'role' in data && 'name' in data && 'last_name' in data && 'username' in data && 'password' in data && 'profile_picture' in data && 'email' in data && 'balance' in data && 'address' in data && 'phone' in data && 'is_active' in data && 'dni' in data && 'patent' in data && 'dni_frontal_picture' in data && 'dni_back_picture' in data && 'vehicle_picture' in data;
};

// deno-lint-ignore no-explicit-any
export const isAnClient = (data: any): data is ClientSchema => {
  return 'role' in data && 'name' in data && 'last_name' in data && 'username' in data && 'password' in data && 'profile_picture' in data && 'balance' in data && 'address' in data && 'phone' in data && 'is_active' in data && 'payment_method' in data;
};

export const isAnService = (data: any): data is ServiceSchema => {
  return 'client_id' in data && 'scheduled_by' in data && 'origin_address' in data && 'destination_address' in data && 'who_receives' in data && 'service_status' in data && 'payment_status' in data && 'date_of_service' in data && 'date_of_service' in data && 'collect_money' in data && 'upon_delivery' in data && 'payment_method' in data && 'service_cost' in data && 'service_type' in data;
}
