import { Router } from "../deps.ts";

import { adminLogin } from "../controllers/admin/admin-login.ts";
import { adminUpdate } from "../controllers/admin/admin-update.ts";
import { adminUpdateCriticalFields } from "../controllers/admin/admin-critical-fields.ts";

import { getRole } from "../controllers/get-role.ts";
import { administrativeLogin } from "../controllers/administrative-login.ts";
import { adminRegisterUsers } from "../controllers/administrative-register-users.ts";
import { administrativeUpdateFields } from "../controllers/administrative-update-fields.ts";

import { schedulerLogin } from "../controllers/scheduler/scheduler-login.ts"
import { schedulerUpdate } from "../controllers/scheduler/scheduler-update.ts"
import { schedulerUpdateCriticalFields } from "../controllers/scheduler/scheduler-critical-fields.ts"

import { cadetLogin } from "../controllers/cadet/cadet-login.ts";
import { cadetUpdate } from "../controllers/cadet/cadet-update.ts";
import { cadetUpdateCriticalFields } from "../controllers/cadet/cadet-update-critical-fields.ts";

import { getAllBanks } from "../controllers/service/get-all-banks.ts";
import { createService } from "../controllers/service/crete-service.ts";
import { updateService } from "../controllers/service/update-service.ts";
import { deleteService } from "../controllers/service/delete-service.ts";
import { cadetsServices } from "../controllers/service/cadet-services.ts";
import { getServicesSorted } from "../controllers/service/get-services-sorted.ts"
import { getAllCadetsBanks } from "../controllers/service/get-all-cadets-banks.ts";

import { logout } from "../controllers/log-out.ts";

export const router = new Router();

// Admin api endpoints
router
  .post("/admin", adminLogin) // admin log in
  .put("/admin", adminUpdate) // update admin data
  .put("/admin/critical", adminUpdateCriticalFields) // update admin username, password and email information

// verify administrative login
router
  .get("/unico/:role", getRole)
  .get("/unico//verify/", administrativeLogin) // validate administrative users login (admins, allocators, schedulers)
  .post("/unico/register/:role", adminRegisterUsers) // register users (allocators, schedulers, cadets, clients)
  .put('/unico/update/:role/:id', administrativeUpdateFields)

// Scheduler api endpoints
router
  .post("/scheduler", schedulerLogin) // scheduler log in
  .put("/scheduler", schedulerUpdate) // update scheduler data
  .put("/scheduler/critical", schedulerUpdateCriticalFields) // update scheduler username, password and email information

// Cadets api endpoints
router
  .post("/cadet", cadetLogin) // cadet login
  .put("/cadet", cadetUpdate) // update cadet data
  .post("/cadet/critical", cadetUpdateCriticalFields) // cadet update username, password and email information

// services api endpoints
router
  .post("/services", createService) // create a service
  .put("/services/:id", updateService) // update a service
  .get("/services/banks", getAllBanks) // get all banks
  .delete("/services/:id", deleteService) // delete a service
  .get("/services/:sort", getServicesSorted) // get all services available * ascending * (admins and assistants)
  .get("/services/banks/:id", getAllCadetsBanks)
  .get("/services/cadet/:id/:sort", cadetsServices) // get all services available for a cadet

// Log-out api endpoint
router
  .get("/logout", logout) // log out the user
  .post("/logout", logout) // log out the user too