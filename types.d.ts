import { Bson } from "./deps.ts";

// admin, allocator, scheduler, cadet, client
type ServiceStatus = 'nuevo' | 'por retirar' | 'por entregar' | 'terminado';
type Models = 'admins' | 'assistants' | 'cadets' | 'clients' | 'services';
type Role = "admin" | "asignador" | "agendador" | "cadete" | "cliente";
type ServiceType = 'Flex' | 'e-Commerce' | 'Express' | 'Correo' | 'Resmis/Flete';
type PaymentMethod = "Efectivo" | "Transferencia";
type PaymentStatus = 'pagado' | 'no pagado';

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

export interface ServiceSchema {
  client_id: Bson.ObjectId; // cleint id to populate info
  delivered_by_admin?: Bson.ObjectId;
  delivered_by_assistant?: Bson.ObjectId;
  delivered_by_cadet?: Bson.ObjectId;
  picked_up_by_admin?: Bson.ObjectId;
  picked_up_by_assistant?: Bson.ObjectId;
  picked_up_by_cadet?: Bson.ObjectId;
  scheduled_by_admin: Bson.ObjectId;
  scheduled_by_aassistant: Bson.ObjectId;
  origin_address: string;
  origin_address_details?: string;
  destination_address: string;
  destination_address_details?: string;
  who_receives: string;
  who_receives_phone?: string;
  who_receives_schedule?: Schedule;
  service_status: ServiceStatus;
  payment_status: PaymentStatus;
  date_of_service: Date;
  schedule_of_origin?: Schedule;
  schedule_of_destination?: Schedule;
  // recibir dinero en destino para devovler
  collect_money: boolean;
  collect_money_amount?: number;
  return_collected_money_to_admin?: Bson.ObjectId;
  return_collected_money_to_assistant?: Bson.ObjectId;
  return_collected_money_to_cadet?: Bson.ObjectId;
  // contraentrega (pago del servicio en destino)
  upon_delivery: boolean;
  payment_method: PaymentMethod;
  // costo del servicio sin importar si es contraentrega o no
  service_cost: number;
  service_type: ServiceType;
  payment_of_delivery_cadet?: number; // If the service is delivered and picked up by different cadets, this is delivery cadet payment amount.
}