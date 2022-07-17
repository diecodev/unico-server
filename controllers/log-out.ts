import { Context } from '../deps.ts';

export const logout = async (context: Context) => {
  if (!(await context.cookies.get('untk', { signed: true })) && !(await context.cookies.get('untkad', { signed: true }))) {
    context.response.status = 401;
    context.response.body = {
      meesage: 'You do not have permission to access this resource.',
    };
    return;
  }

  await context.cookies.set('untk', null, {
    maxAge: -1,
    path: '/',
    signed: false,
  });

  await context.cookies.set('untkad', null, {
    maxAge: -1,
    path: '/',
    signed: false,
  });
  context.response.status = 200;
  context.response.body = {
    message: 'Logged out successfully.',
    data: {},
    isLoggedIn: false,
  };
  return;
};
