import { Application } from "./deps.ts";
import { router } from "./routes/index.routes.ts";

const PORT = parseInt(Deno.env.get("PORT") as string) || 5000;

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Server is running on http://localhost:${PORT}`);
await app.listen({ port: PORT });
