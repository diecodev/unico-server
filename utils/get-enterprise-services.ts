import db from './db.ts';
import { getIntervals } from './get-intervals.ts';
import type { ServiceSchema } from '../types.d.ts';
import { populateServiceOptions } from '../constants.ts'

interface Props {
  sort: 'asc' | 'desc';
}

export const getEnterpriseServices = async ({ sort }: Props) => {
  const { first_date, last_date } = getIntervals(sort === 'asc');

  const service_model = db.collection<ServiceSchema>('services');

  const services = await service_model.aggregate([
    { $match: { date_of_service: { $gte: sort === "asc" ? first_date : last_date, $lt: sort === "asc" ? last_date : first_date } } },
    ...populateServiceOptions,
    {
      $group: {
        _id: '$date_of_service',
        data: { $push: '$$ROOT' },
      },
    },
    { $sort: { _id: sort === 'asc' ? 1 : -1 } },
  ], { allowDiskUse: true }).toArray() as ServiceSchema[];

  return services;
}
