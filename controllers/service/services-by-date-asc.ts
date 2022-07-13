import type { AdminSchema, ServiceSchema } from '../../types.d.ts';
import db from '../../utils/db.ts'
import { Context, verifyJwt } from '../../deps.ts';
import { privateKey } from '../../constants.ts';
import { getIntervals } from "../../utils/get-intervals.ts"

export const servicesByDateAscendig = async ({ cookies, response }: Context) => {
  const token = await cookies.get('untk');

  response.status = 401;
  response.type = 'application/json';

  const { first_date, last_date } = getIntervals()

  try {
    if (!token) throw new Error('Unauthorized.');

    const decoded_token = (await verifyJwt(token, privateKey)).payload as unknown as AdminSchema;

    if (decoded_token.role !== 'admin' && decoded_token.role !== 'asignador' && decoded_token.role !== 'agendador') throw new Error('Unauthorized.');

    const service_model = db.collection<Partial<ServiceSchema>>('services');

    const services = await service_model.find({ date_of_service: { $gte: first_date, $lte: last_date } }).sort({ date_of_service: 1 }).toArray();

    const list_of_services = await (async () => {
      const services_list = [];

      for await (const service of services) {
        if (service.service_status === 'nuevo') {
          services_list.push(service);
          continue
        }

        const model_one = db.collection<AdminSchema>(service.delivered_by_model as string);

        const deliver = await model_one.findOne({ _id: service.delivered_by }, {
          projection: {
            role: 1,
            name: 1,
            username: 1,
            last_name: 1,
            profile_picture: 1,
          }
        });

        const model_two = db.collection<AdminSchema>(service.picked_up_by_model as string);

        const picker = await model_two.findOne({ _id: service.picked_up_by }, {
          projection: {
            role: 1,
            name: 1,
            username: 1,
            last_name: 1,
            profile_picture: 1,
          }
        });

        delete service.delivered_by_model;
        delete service.picked_up_by_model;

        service.delivered_by = deliver;
        service.picked_up_by = picker;


        if (service.return_collected_money_to) {
          const model_three = db.collection<AdminSchema>(service.return_collected_money_to_model as string);

          const collector = await model_three.findOne({ _id: service.return_collected_money_to }, {
            projection: {
              role: 1,
              name: 1,
              username: 1,
              last_name: 1,
              profile_picture: 1,
            }
          });


          delete service.return_collected_money_to_model;

          service.return_collected_money_to = collector;
        }

        services_list.push(service);
        continue;
      }

      return services_list;
    })();

    response.status = 200;
    response.body = { data: list_of_services };

  } catch (error) {
    response.body = { error: error.toString() };
  }
}