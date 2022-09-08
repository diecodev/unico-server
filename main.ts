import { Application } from './deps.ts';
import { router } from './routes/index.routes.ts';

const PORT = 5000;
const SECRET_ONE = Deno.env.get('COOKIE_SECRET_ONE') as string;
const SECRET_TWO = Deno.env.get('COOKIE_SECRET_TWO') as string;

const app = new Application({ keys: [SECRET_ONE, SECRET_TWO] });
app.use(router.routes());
app.use(router.allowedMethods());
app.addEventListener('error', (event) => {
  console.log({ error: event.error });
})

console.log(`Server is running on http://localhost:${PORT}`);
await app.listen({ port: PORT });
