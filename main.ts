import { Application } from './deps.ts';
import { router } from './routes/index.routes.ts';

const PORT = 5000;
const SECRET_ONE = Deno.env.get('COOKIE_SECRET_ONE') as string;
const SECRET_TWO = Deno.env.get('COOKIE_SECRET_TWO') as string;

const app = new Application({ keys: [SECRET_ONE, SECRET_TWO] });
const controller = new AbortController();

app.use(router.routes());
app.use(router.allowedMethods());

// If there is an error, reset the connection
app.addEventListener('error', (evt) => {
  if ("stack" in evt.error) {
    console.log({stack: evt.error.stack});
  } else if ("message" in evt.error) {
    console.log({message: evt.error.message});
  } else {
    console.log(`An undefined application error occurred.`);
  }
})

console.log(`Server is running on http://localhost:${PORT}`);
await app.listen({ port: PORT, signal: controller.signal });
