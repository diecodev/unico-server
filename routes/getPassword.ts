import db from '../utils/db.ts'
import { CadetSchema } from '../types.d.ts'
import { Bson, bcrypt, Context } from '../deps.ts'

export const getPassword = async ({ request, response }: Context) => {

  const { password, id, role, ...body } = await request.body({ type: 'json' }).value
  const _id = new Bson.ObjectId(id)

  const salt = bcrypt.genSaltSync(10)

  const new_password = bcrypt.hashSync(password, salt);

  const cadet = db.collection<CadetSchema>(role);

  const new_cadet = await cadet.findAndModify({ _id }, { update: { $set: { ...body, password: new_password } }, new: true });

  // const new_cadet = await cadet.insertOne({ ...body, password: new_password })

  response.status = 200
  response.body = { new_cadet }
}