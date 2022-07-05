import { Router } from "../deps.ts";
import { adminLogin } from "../controllers/admin/admin-login.ts";
import { logout } from "../controllers/log-out.ts";
import { administrativeLogin } from "../controllers/administrative-login.ts";
import { adminUpdate } from "../controllers/admin/admin-update.ts";
import { adminRegisterUsers } from "../controllers/administrative-register-users.ts";
import { assistantLogin } from "../controllers/assistant/assistant-login.ts"
import { assistantUpdate } from "../controllers/assistant/assistant-update.ts"

export const router = new Router();

// Admin api endpoints
router
  .post("/admin", adminLogin) // admin log in
  .put("/admin", adminUpdate) // update admin data

// verify administrative login
router
  .get("/verify/administrative", administrativeLogin) // validate administrative users login (admins, allocators, schedulers)
  .post("/register/:role", adminRegisterUsers) // register users (allocators, schedulers, cadets, clients)

// Assistans api endpoints
router
  .post("/assistant", assistantLogin) // assistant log in
  .put("/assistant", assistantUpdate) // update assistant data

// Log-out api endpoint
router
  .get("/logout", logout) // log out the user
  .post("/logout", logout); // log out the user too
