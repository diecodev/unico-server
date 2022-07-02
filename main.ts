import { Application, Router, dotEnv } from "./deps.ts";
import { logout } from "./routes/logout.ts";
import { adminLogin } from "./routes/admin/index.ts";

const PORT = 5000;

const router = new Router();

dotEnv({ export: true });

router
  .get("/logout", logout) // log out the user
  .post("/logout", logout) // log out the user too
  .post("/admin", adminLogin);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Server is running on http://localhost:${PORT}`);
await app.listen({ port: PORT });
({ port: PORT });