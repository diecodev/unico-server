import db from '../../utils/db.ts';
import { CadetSchema } from '../../types.d.ts';
import { privateKey, options } from '../../constants.ts';
import { Context, signJwt, verifyJwt } from '../../deps.ts';
import { encryptPassword } from '../../constants.ts';
import { TokenData } from '../controllers.types.d.ts';

export const cadetUpdateCriticalFields = async ({ request, response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get('untkca', { signed: true });

  // setting response type to json and error status to 403
  response.type = 'application/json';
  response.status = 403;

  try {
    // If cookie is not found, return error
    if (!token) {
      throw new Error('You do not have permission to access this resource.');
    }

    // If request do not have body, return error
    if (!request.hasBody) throw new Error('No data provided.');

    // getting the body of the request
    const { username, password, email } = await request.body({ type: 'json' }).value as Partial<CadetSchema>;

    if (!username && !password && !email) throw new Error('No data provided.');

    // Verifying the token
    const payload = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if user is not admin, return error
    if ((payload.role !== 'cadete' && payload.role !== 'asignador') || !payload.isLoggedIn) throw new Error('You do not have permission execute this action.');

    // Connecting to DB and updating data
    const cadet = db.collection<CadetSchema>('cadets');

    // hashing new password if it is provided
    let new_password: string | undefined = undefined;

    if (password) {
      new_password = encryptPassword(password);
    }

    // updating data
    const admin_updated = await cadet.updateOne(
      { _id: payload._id },
      { username, password: new_password, email },
    );

    // If cadet does not exist, return error
    if (!admin_updated.modifiedCount) throw new Error('No data found.');

    // If cadet is updated, return new admin data...
    const new_cadet = await cadet.findOne({ _id: payload._id }) as CadetSchema;

    const jwt_data = {
      role: new_cadet.role,
      _id: new_cadet._id,
      isLoggedIn: true,
    }

    // If everything is fine, create a new token and return the new data
    const new_token = await new signJwt(jwt_data).setProtectedHeader({ alg: 'HS256' }).sign(privateKey)

    // If everything is ok, return the new data
    response.status = 200;
    response.body = { data: new_cadet };
    await cookies.set('untkca', new_token, options);
    return;
  } catch (error) {
    // If there is an error, return error
    if (error instanceof Error) {
      return response.body = { error: error.message };
    }

    return response.body = { error: 'Something went wrong.' };
  }
};
