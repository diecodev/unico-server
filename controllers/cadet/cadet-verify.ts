import { Context, verifyJwt, Bson } from '../../deps.ts';
import db from '../../utils/db.ts';
import { privateKey } from '../../constants.ts';
import { CadetSchema } from '../../types.d.ts';
import { TokenData } from '../controllers.types.d.ts';

export const cadetVerify = async ({ response, cookies }: Context) => {
  // Taking the cookie
  const token = await cookies.get('untkca', { signed: true });

  // setting the response status and response type
  response.status = 401;
  response.type = 'application/json';

  try {
    // if request do not have cookies, return error
    if (!token) throw new Error('You do not have permission to access this resource.');

    // verifying the token
    const { role, _id, isLoggedIn } = (await verifyJwt(token, privateKey)).payload as unknown as TokenData;

    // if user is not logged in, return error
    if (!isLoggedIn) throw new Error('You do not have permission to access this resource.');

    // If user role is admin, or scheduler, then continue...
    if (role === 'cadete' || role === 'asignador') {
      // connecting to DB and consulting data
      const user = db.collection<CadetSchema>('cadets');
      const user_data = await user.findOne({ _id: new Bson.ObjectId(_id) }) as Partial<CadetSchema>;

      // Deleting password for admin
      delete user_data.password;

      // returning the data
      response.status = 200;
      response.body = { data: user_data, isLoggedIn };
      return;
    }

    // If user role is not admin or schedduler, then return error
    throw new Error('You do not have permission to access this resource.');

    // If token is not valid, return error
  } catch (error) {
    if (error instanceof Error) return response.body = { error: error.message };

    return response.body = { error: error.toString() };
  }
};
