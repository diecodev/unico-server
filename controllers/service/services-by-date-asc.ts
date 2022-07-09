import type { AdminSchema, ServiceSchema } from '../../types.d.ts';
import db from '../../utils/db.ts'
import { Context, verifyJwt } from '../../deps.ts';
import { privateKey } from '../../constants.ts';

export const servicesByDateAscendig = async ({ request, cookies, response }: Context) => {
  const token = await cookies.get('untk');

  response.status = 401;
  response.type = 'application/json';

  const date = new Date()

  const new_date = date.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour12: false,
  });

  const valid_new_date = new_date.split(',')[0].replaceAll('/', '-');

  const new_date_format = new Date(valid_new_date);


  // return response.body = { valid_new_date };

  try {
    // if (!token) throw new Error('Unauthorized.');

    // const decoded_token = (await verifyJwt(token, privateKey)).payload as unknown as AdminSchema;

    // if (decoded_token.role !== 'admin' && decoded_token.role !== 'asignador' && decoded_token.role !== 'agendador') throw new Error('Unauthorized.');

    const services = db.collection<ServiceSchema>('services');

    const services_list = await services.aggregate([
      {
        $lookup: {
          from: "admins",
          let: {
            admin1: "$delivered_by_admin",
            admin2: "$picked_up_by_admin",
            admin3: "$scheduled_by_admin",
            admin4: "$return_collected_money_to_admin",
          },
          pipeline: [{
            $match: {
              $expr: {
                $or: [{ $eq: ["$_id", "$$admin1"] }, { $eq: ["$_id", "$$admin2"] }, { $eq: ["$_id", "$$admin3"] }, { $eq: ["$_id", "$$admin4"] }]
              }
            }
          }],
          as: "admin_info"
        },
      },
      {
        $lookup: {
          from: "cadets",
          let: {
            cadet1: "$delivered_by_cadet",
            cadet2: "$picked_up_by_cadet",
            cadet3: "$return_collected_money_to_cadet",
          },
          pipeline: [{
            $match: {
              $expr: {
                $or: [{ $eq: ["$_id", "$$cadet1"] }, { $eq: ["$_id", "$$cadet2"] }, { $eq: ["$_id", "$$cadet3"] }]
              }
            }
          }],
          as: "cadet_info"
        },
      },
      {
        $lookup: {
          from: "assistants",
          let: {
            assistant1: "$delivered_by_assistant",
            assistant2: "$picked_up_by_assistant",
            assistant3: "$scheduled_by_assistant",
            assistant4: "$return_collected_money_to_assistant",
          },
          pipeline: [{
            $match: {
              $expr: {
                $or: [{ $eq: ["$_id", "$$assistant1"] }, { $eq: ["$_id", "$$assistant2"] }, { $eq: ["$_id", "$$assistant3"] }, { $eq: ["$_id", "$$assistant4"] }]
              }
            }
          }],
          as: "assistant_info"
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "client_id",
          foreignField: "_id",
          as: "client_id"
        }
      },
      {
        $unset: [
          'admin_info.balance',
          'admin_info.email',
          'admin_info.password',
          'admin_info.profile_picture',

          'cadet_info.email',
          'cadet_info.username',
          'cadet_info.balance',
          'cadet_info.direction',
          'cadet_info.phone',
          'cadet_info.profile_picture',
          'cadet_info.dni',
          'cadet_info.patent',
          'cadet_info.dni_frontal_picture',
          'cadet_info.dni_back_picture',
          'cadet_info.vehicle_picture',
          'cadet_info.is_active',

          'client_id.email',
          'client_id.address',
          'client_id.password',
          'client_id.balance',
          'client_id.is_active',
          'client_id.payment_method',
          'client_id.schedule',
          'client_id.enterprise',
          'client_id.employee_name',
        ]
      },
      {
        $project: {
          // client_id: Bson.ObjectId; // cleint id to populate info
          origin_address: 1,
          origin_address_details: 1,
          destination_address: 1,
          destination_address_details: 1,
          who_receives: 1,
          who_receives_phone: 1,
          who_receives_schedule: 1,
          service_status: 1,
          payment_status: 1,
          date_of_service: 1,
          schedule_of_origin: 1,
          schedule_of_destination: 1,
          // recibir dinero en destino para devovler
          collect_money: 1,
          collect_money_amount: 1,
          // contraentrega (pago del servicio en destino)
          upon_delivery: 1,
          payment_method: 1,
          // costo del servicio sin importar si es contraentrega o no
          service_cost: 1,
          service_type: 1,
          payment_of_delivery_cadet: 1,
          delivered_by_admin: {
            $filter: {
              input: '$admin_info',
              as: 'admin',
              cond: { $eq: ['$$admin._id', '$delivered_by_admin'] }
            }
          },
          delivered_by_assistant: {
            $filter: {
              input: '$assistant_info',
              as: 'assistant',
              cond: { $eq: ['$$assistant._id', '$delivered_by_assistant'] }
            }
          },
          delivered_by_cadet: {
            $filter: {
              input: '$cadet_info',
              as: 'cadet',
              cond: { $eq: ['$$cadet._id', '$delivered_by_cadet'] }
            }
          },

          picked_up_by_admin: {
            $filter: {
              input: '$admin_info',
              as: 'admin',
              cond: { $eq: ['$$admin._id', '$picked_up_by_admin'] }
            }
          },
          picked_up_by_assistant: {
            $filter: {
              input: '$assistant_info',
              as: 'assistant',
              cond: { $eq: ['$$assistant._id', '$picked_up_by_assistant'] }
            }
          },
          picked_up_by_cadet: {
            $filter: {
              input: '$cadet_info',
              as: 'cadet',
              cond: { $eq: ['$$cadet._id', '$picked_up_by_cadet'] }
            }
          },

          scheduled_by_admin: {
            $filter: {
              input: '$admin_info',
              as: 'admin',
              cond: { $eq: ['$$admin._id', '$scheduled_by_admin'] }
            }
          },
          scheduled_by_assistant: {
            $filter: {
              input: '$assistant_info',
              as: 'assistant',
              cond: { $eq: ['$$assistant._id', '$scheduled_by_assistant'] }
            }
          },

          return_collected_money_to_admin: {
            $filter: {
              input: '$admin_info',
              as: 'admin',
              cond: { $eq: ['$$admin._id', '$return_collected_money_to_admin'] }
            }
          },
          return_collected_money_to_assistant: {
            $filter: {
              input: '$assistant_info',
              as: 'assistant',
              cond: { $eq: ['$$assistant._id', '$return_collected_money_to_assistant'] }
            }
          },
          return_collected_money_to_cadet: {
            $filter: {
              input: '$cadet_info',
              as: 'cadet',
              cond: { $eq: ['$$cadet._id', '$return_collected_money_to_cadet'] }
            }
          },
        }
      },
      {
        $unwind: {
          path: "$delivered_by_admin",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$delivered_by_assistant",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$delivered_by_cadet",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$picked_up_by_admin",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$picked_up_by_assistant",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$picked_up_by_cadet",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$scheduled_by_admin",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$scheduled_by_assistant",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$return_collected_money_to_admin",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$return_collected_money_to_assistant",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$return_collected_money_to_cadet",
          preserveNullAndEmptyArrays: true
        }
      },
    ]).toArray();



    response.status = 200;
    response.body = { data: services_list };

  } catch (error) {
    response.body = { error: error.toString() };
  }
}