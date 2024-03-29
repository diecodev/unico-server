import { Router, Bson } from '../deps.ts';
import db from '../utils/db.ts';
import { ServiceSchema } from '../types.d.ts';

import { adminLogin } from '../controllers/admin/admin-login.ts';
import { adminUpdate } from '../controllers/admin/admin-update.ts';
import { adminUpdateCriticalFields } from '../controllers/admin/admin-critical-fields.ts';

import { getRole } from '../controllers/get-role.ts';
import { administrativeLogin } from '../controllers/administrative-login.ts';
import { adminRegisterUsers } from '../controllers/administrative-register-users.ts';
import { administrativeUpdateFields } from '../controllers/administrative-update-fields.ts';
import { updateBalance } from '../controllers/update-balance.ts';
import { administrativeHistory } from '../controllers/administrative-history.ts';

import { schedulerLogin } from '../controllers/scheduler/scheduler-login.ts'
import { schedulerUpdate } from '../controllers/scheduler/scheduler-update.ts'
import { schedulerUpdateCriticalFields } from '../controllers/scheduler/scheduler-critical-fields.ts'

import { cadetVerify } from '../controllers/cadet/cadet-verify.ts';
import { cadetLogin } from '../controllers/cadet/cadet-login.ts';
import { cadetUpdate } from '../controllers/cadet/cadet-update.ts';
import { cadetUpdateCriticalFields } from '../controllers/cadet/cadet-update-critical-fields.ts';
import { getCadetsBanksGrouped } from '../controllers/cadet/get-all-banks.ts';
import { cadetPendingServices } from '../controllers/cadet/cadet-pending-services.ts'
import { cadetHistory } from '../controllers/cadet/cadet-history.ts'

import { getAllBanks } from '../controllers/service/get-all-banks.ts';
import { createService } from '../controllers/service/create-service.ts';
import { updateService } from '../controllers/service/update-service.ts';
import { deleteService } from '../controllers/service/delete-service.ts';
import { cadetsServices } from '../controllers/service/cadet-services.ts';
import { roleServices } from '../controllers/service/role-services.ts';
import { getServicesSorted } from '../controllers/service/get-services-sorted.ts'
import { getAllCadetsBanks } from '../controllers/service/get-all-cadets-banks.ts';

// import { getAllZones, createZone, updateZones, updateZonesPrices, createZonesPrices } from '../controllers/zones/zones.ts';

import { logout } from '../controllers/log-out.ts';

import { getPassword } from './getPassword.ts'

export const router = new Router();

router.post('/services/invoice', async (ctx) => {
  const { initialDate, endDate, clientId } = await ctx.request.body().value
  const model = db.collection<ServiceSchema>('services')

  const result = await model.find({ date_of_service: { $gte: new Date(initialDate), $lte: new Date(endDate) }, client_id: new Bson.ObjectId(clientId) }).sort({ date_of_service: -1 }).toArray();


  ctx.response.type = 'application/json'
  ctx.response.status = 200
  ctx.response.body = { data: result }
})
// test 
// router.get('/', async ({ response }) => {
//   const decoder = new TextDecoder("utf-8");
//   const bytes = await Deno.readFile("index.html");
//   const text = decoder.decode(bytes);

//   response.type = "text/html";
//   response.body = text;
// })

router.post('/reset-password', getPassword)

// Admin api endpoints
router
  .post('/admin', adminLogin) // admin log in
  .put('/admin', adminUpdate) // update admin data
  .put('/admin/critical', adminUpdateCriticalFields) // update admin username, password and email information

// verify administrative login
router
  .get('/unico/verify', administrativeLogin) // validate administrative users login (admins, allocators, schedulers)
  .get('/unico/employees/:role', getRole) // get all data from a single role, ex: get all admins, allocators, schedulers (role = admin || allocator || scheduler)
  .post('/unico/register/:role', adminRegisterUsers) // register users (allocators, schedulers, cadets, clients)
  .put('/unico/update/:role/:id', administrativeUpdateFields)
  .put('/unico/balance/:role/:sort', updateBalance)
  .get('/unico/history', administrativeHistory)

// Scheduler api endpoints
router
  .post('/scheduler', schedulerLogin) // scheduler log in
  .put('/scheduler', schedulerUpdate) // update scheduler data
  .put('/scheduler/critical', schedulerUpdateCriticalFields) // update scheduler username, password and email information

// Cadets api endpoints
router
  .get('/cadet', cadetVerify) // verify cadet login to keep session alive
  .post('/cadet', cadetLogin) // cadet login
  .put('/cadet', cadetUpdate) // update cadet data
  .post('/cadet/critical', cadetUpdateCriticalFields) // cadet update username, password and email information
  .get('/cadet/banks', getCadetsBanksGrouped) // get all cadets banks grouped by id, services and total bank amount
  .get('/cadet/pending/:id', cadetPendingServices) // get all the services that are pending to complete for a single cadet
  .get('/cadet/history/:id', cadetHistory) // get the history of all services to one cadet

// services api endpoint
router
  .post('/services', createService) // create a service
  .put('/services/:id', updateService) // update a service
  .get('/services/banks', getAllBanks) // get all banks
  .delete('/services/:id', deleteService) // delete a service
  .get('/services/:sort', getServicesSorted) // get all services available * ascending * (admins and assistants)
  .get('/services/banks/:id', getAllCadetsBanks)
  .get('/services/cadet/:id/:sort', cadetsServices) // get all services available for a cadet
  .get('/services/:role/:id', roleServices) // get all services available for a cadet

// zones api endpoints
// router
//   .get('/zones', getAllZones) // get all zones
//   .post('/zones', createZone) // update zones
//   .put('/zones', updateZones) // update zones
//   .post('/zones/prices', createZonesPrices) // update zones prices
//   .put('/zones/prices', updateZonesPrices) // update zones prices

// Log-out api endpoint
router
  .get('/logout', logout) // log out the user
  .post('/logout', logout) // log out the user too