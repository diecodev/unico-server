import db from '../../utils/db.ts';
import { ZonesSchema, PricesSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts';
import { Context, verifyJwt, Bson } from '../../deps.ts';
import { privateKey } from '../../constants.ts'

export const getAllZones = async ({ response }: Context) => {
  try {
    // taking the zones data from db
    const model = db.collection<ZonesSchema>('zones');

    //populating the zones data
    const zones = await model.aggregate([
      {
        $lookup: {
          from: 'prices',
          localField: 'price_id',
          foreignField: '_id',
          as: 'price'
        }
      },
      {
        $unwind: '$price'
      },
      {
        $group: {
          _id: '$price._id',
          name: { $first: '$price.name' },
          prices: { $first: '$price' },
          zones: { $push: '$$ROOT' },
        }
      },
      {
        $unset: ['prices.name', 'prices._id', 'zones.price', 'zones.price_id']
      },
      {
        $sort: { 'prices.price_flex': 1 }
      }
    ]).toArray();

    response.status = 200;
    return response.body = { data: zones };

  } catch (error) {
    // If there is an error, return an error message
    if (error instanceof Error) {
      response.body = { error: error.message };
    } else {
      response.body = { error: error.toString() };
    }
  }

}

export const createZone = async ({ request, response, cookies }: Context) => {
  // taking the token from the cookies
  const token = await cookies.get('untkad', { signed: true });

  // setting the response in case of return an error
  response.status = 404;
  response.type = 'application/json';

  try {
    if (!token) throw new Error('No token found');

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if the role is not admin or scheduler, throw an error
    if (payload.role !== 'agendador' && payload.role !== 'admin') throw new Error('You are not authorized to perform this action');

    // taking the body from the request
    const body = await request.body({ type: 'json' }).value as ZonesSchema;
    const { locality, price_id } = body;
    const priceId = new Bson.ObjectId(price_id);

    // connecting the db collection
    const model = db.collection<ZonesSchema>('zones');

    // checking if the zone already exists
    const existingZone = await model.findOne({ locality });

    // if the zone already exists, throw an error
    if (existingZone) throw new Error('Zone already exists');

    // inserting the zone into the db
    const zone = await model.insertOne({ locality, price_id: priceId });

    // returning the zone data
    response.status = 201;
    return response.body = { data: zone };
  } catch (error) {
    // If there is an error, return an error message
    if (error instanceof Error) {
      response.body = { error: error.message };
    } else {
      response.body = { error: error.toString() };
    }
  }
}

export const updateZones = async ({ request, response, cookies }: Context) => {
  // taking the token from the cookies
  const token = await cookies.get('untkad', { signed: true });

  // setting the response in case of return an error
  response.status = 404;
  response.type = 'application/json';

  try {
    if (!token) throw new Error('No token found');

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if the role is not admin or scheduler, throw an error
    if (payload.role !== 'agendador' && payload.role !== 'admin') throw new Error('You are not authorized to perform this action');

    // taking the body from the request
    const body = await request.body({ type: 'json' }).value as ZonesSchema;
    const { locality, price_id, _id } = body;

    const priceId = new Bson.ObjectId(price_id);

    // connecting the db collection
    const model = db.collection<ZonesSchema>('zones');

    // checking if the zone already exists
    const existingZone = await model.findOne({ locality });

    // if the zone already exists, throw an error
    if (!existingZone) throw new Error('Not found');

    // updating the zone into the db
    const zone = await model.updateOne({ _id }, { $set: { price_id: priceId } });

    // returning the zone data
    response.status = 200;
    return response.body = { data: zone };
  } catch (error) {
    // If there is an error, return an error message
    if (error instanceof Error) {
      response.body = { error: error.message };
    } else {
      response.body = { error: error.toString() };
    }
  }
}

export const createZonesPrices = async ({ request, response, cookies }: Context) => {
  // taking the token from the cookies
  const token = await cookies.get('untkad', { signed: true });

  // setting the response in case of return an error
  response.status = 404;
  response.type = 'application/json';

  try {
    if (!token) throw new Error('No token found');

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if the role is not admin or scheduler, throw an error
    if (payload.role !== 'admin') throw new Error('Not found');

    // taking the body from the request
    const body = await request.body({ type: 'json' }).value as PricesSchema;
    const { name, price_correo, price_ecommerce, price_express, price_flex } = body;

    // connecting the db collection
    const model = db.collection<PricesSchema>('prices');

    // checking if the zone already exists
    const existingPriceZone = await model.findOne({ name });

    // if the zone already exists, throw an error
    if (existingPriceZone) throw new Error('Not found');

    // inserting the zone into the db
    const price = await model.insertOne({ name, price_flex, price_correo, price_express, price_ecommerce });
    // returning the zone data
    response.status = 201;
    return response.body = { data: price };
  } catch (error) {
    // If there is an error, return an error message
    if (error instanceof Error) {
      response.body = { error: error.message };
    } else {
      response.body = { error: error.toString() };
    }
  }
}

export const updateZonesPrices = async ({ request, response, cookies }: Context) => {
  // taking the token from the cookies
  const token = await cookies.get('untkad', { signed: true });

  // setting the response in case of return an error
  response.status = 404;
  response.type = 'application/json';

  try {
    if (!token) throw new Error('Not found');

    // verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if the role is not admin or scheduler, throw an error
    if (payload.role !== 'admin') throw new Error('Not found');

    // taking the body from the request
    const body = await request.body({ type: 'json' }).value as PricesSchema;
    const { name, price_correo, price_ecommerce, price_express, price_flex } = body;

    // connecting the db collection
    const model = db.collection<PricesSchema>('prices');
    // checking if the zone already exists
    const existingZone = await model.findOne({ name });
    // if the zone already exists, throw an error
    if (!existingZone) throw new Error('Not found');

    // updating the zone into the db
    const priceZone = await model.updateOne({ name }, { $set: { price_correo, price_ecommerce, price_express, price_flex } });

    // returning the zone data
    response.status = 200;
    return response.body = { data: priceZone };
  } catch (error) {
    // If there is an error, return an error message
    if (error instanceof Error) {
      response.body = { error: error.message };
    } else {
      response.body = { error: error.toString() };
    }
  }
}
