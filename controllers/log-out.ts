import { Context } from '../deps.ts';

export const logout = async (context: Context) => {
  if (!(await context.cookies.get('untk', { signed: true })) && !(await context.cookies.get('untkad', { signed: true }))) {
    context.response.status = 401;
    context.response.body = {
      meesage: 'You do not have permission to access this resource.',
    };
    return;
  }

  context.cookies.delete('untk', {
    maxAge: -1,
    path: '/',
  });

  context.cookies.delete('untkad', {
    maxAge: -1,
    path: '/',
  });
  context.response.status = 200;
  context.response.body = {
    message: 'Logged out successfully.',
    data: {},
    isLoggedIn: false,
  };
  return;
};
