import type { CookiesSetDeleteOptions } from './deps.ts';
import { bcrypt } from './deps.ts';

export const privateKey = new TextEncoder().encode(Deno.env.get('SECRET'));

export const options: CookiesSetDeleteOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'strict',
  secure: Deno.env.get('ENVIRONMENT') !== 'development',
  maxAge: 60 * 60 * 24 * 31 * 12,
  ignoreInsecure: true,
  signed: true,
};

export const encryptPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export const populateServiceOptions = [
  {
    $lookup: {
      from: 'clients',
      localField: 'client_id',
      foreignField: '_id',
      as: 'client_id'
    }
  },
  {
    $lookup: {
      from: 'cadets',
      localField: 'picked_up_by',
      foreignField: '_id',
      as: 'picked_up_by'
    }
  },
  {
    $lookup: {
      from: 'cadets',
      localField: 'delivered_by',
      foreignField: '_id',
      as: 'delivered_by'
    }
  },
  {
    $lookup: {
      from: 'cadets',
      localField: 'return_collected_money_to',
      foreignField: '_id',
      as: 'return_collected_money_to'
    }
  },
  {
    $lookup: {
      from: 'schedulers',
      localField: 'scheduled_by',
      foreignField: '_id',
      as: 'scheduled_by'
    }
  },
  {
    $unset: [
      'delivered_by.password',
      'delivered_by.email',
      'delivered_by.username',
      'delivered_by.profile_picture',
      'delivered_by.balance',
      'delivered_by.address',
      'delivered_by.phone',
      'delivered_by.is_active',
      'delivered_by.dni',
      'delivered_by.patent',
      'delivered_by.dni_frontal_picture',
      'delivered_by.dni_back_picture',
      'delivered_by.vehicle_picture',

      'picked_up_by.password',
      'picked_up_by.email',
      'picked_up_by.username',
      'picked_up_by.profile_picture',
      'picked_up_by.balance',
      'picked_up_by.address',
      'picked_up_by.phone',
      'picked_up_by.is_active',
      'picked_up_by.dni',
      'picked_up_by.patent',
      'picked_up_by.dni_frontal_picture',
      'picked_up_by.dni_back_picture',
      'picked_up_by.vehicle_picture',

      'return_collected_money_to.password',
      'return_collected_money_to.email',
      'return_collected_money_to.username',
      'return_collected_money_to.profile_picture',
      'return_collected_money_to.balance',
      'return_collected_money_to.address',
      'return_collected_money_to.phone',
      'return_collected_money_to.is_active',
      'return_collected_money_to.dni',
      'return_collected_money_to.patent',
      'return_collected_money_to.dni_frontal_picture',
      'return_collected_money_to.dni_back_picture',
      'return_collected_money_to.vehicle_picture',

      'client_id.role',
      'client_id.password',
      'client_id.balance',
      'client_id.address',
      'client_id.is_active',
      'client_id.payment_method',
      'client_id.schedule',
      'client_id.enterprise',
      'client_id.employee_name',
      'client_id.email',

      'scheduled_by.password',
      'scheduled_by.email',
      'scheduled_by.username',
      'scheduled_by.profile_picture',
      'scheduled_by.balance',
      'scheduled_by.address',
      'scheduled_by.phone',
      'scheduled_by.is_active',
      'scheduled_by.dni',
      'scheduled_by.patent',
      'scheduled_by.dni_frontal_picture',
      'scheduled_by.dni_back_picture',
      'scheduled_by.vehicle_picture',
    ]
  },
  {
    $unwind: {
      path: '$picked_up_by',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: '$client_id',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: '$return_collected_money_to',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: '$delivered_by',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: '$scheduled_by',
      preserveNullAndEmptyArrays: true
    }
  },
]