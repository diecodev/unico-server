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