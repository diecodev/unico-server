import { Router } from "../deps.ts";

import { adminLogin } from "../controllers/admin/admin-login.ts";
import { adminUpdate } from "../controllers/admin/admin-update.ts";
import { adminUpdateCriticalFields } from "../controllers/admin/admin-critical-fields.ts";

import { administrativeLogin } from "../controllers/administrative-login.ts";
import { adminRegisterUsers } from "../controllers/administrative-register-users.ts";

import { schedulerLogin } from "../controllers/scheduler/scheduler-login.ts"
import { schedulerUpdate } from "../controllers/scheduler/scheduler-update.ts"
import { schedulerUpdateCriticalFields } from "../controllers/scheduler/scheduler-critical-fields.ts"

import { cadetLogin } from "../controllers/cadet/cadet-login.ts";

import { servicesByDateAscendig } from "../controllers/service/services-by-date-asc.ts"
import { servicesByDateDescendig } from "../controllers/service/services-by-date-desc.ts"

import { logout } from "../controllers/log-out.ts";

export const router = new Router();

// Admin api endpoints
router
  .post("/admin", adminLogin) // admin log in
  .put("/admin", adminUpdate) // update admin data
  .put("/admin/:field", adminUpdateCriticalFields) // update admin username, password and email information

// verify administrative login
router
  .get("/verify/administrative", administrativeLogin) // validate administrative users login (admins, allocators, schedulers)
  .post("/register/:role", adminRegisterUsers) // register users (allocators, schedulers, cadets, clients)

// Assistans api endpoints
router
  .post("/scheduler", schedulerLogin) // scheduler log in
  .put("/scheduler", schedulerUpdate) // update scheduler data
  .put("/scheduler/:field", schedulerUpdateCriticalFields) // update scheduler username, password and email information

// Cadets api endpoints
router
  .post("/cadet", cadetLogin) // cadet login
  .put("/cadet", () => { }) // update cadet data
  .post("/cadet/:field", () => { }) // cadet update username, password and email information

// services api endpoints
router
  .get("/services", servicesByDateAscendig) // get all services available * ascending * (admins and assistants)
  .get("/services/desc", servicesByDateDescendig) // get all services available * descending * (admins and assistants)
  .get("/services/cadet/:id", () => { }) // get all services available for a cadet

// Log-out api endpoint
router
  .get("/logout", logout) // log out the user
  .post("/logout", logout); // log out the user too
