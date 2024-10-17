const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const {clientOnly} = require('./middleware/clientOnly')
const {adminOnly} = require('./middleware/adminOnly')
const {errorHandler} = require('./middleware/errorHandler')
const { getContractById, getContracts } = require('./controller/contract.controller')
const { getUnpaid, payForJob, deposit } = require('./controller/job.controller')
const { bestProffesion, topPayingClients } = require('./controller/admin.controller')
const app = express();
app.use(errorHandler);
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile, getContractById)

/**
 * @returns Array contracts
 */
app.get('/contracts',getProfile , getContracts)

/**
 * @returns Array jobs
 */
app.get('/jobs/unpaid',getProfile , getUnpaid)

/**
 * @returns status 204
 */
app.post('/jobs/:job_id/pay', getProfile, clientOnly, payForJob)

/**
 * MESSAGE TO THE REVIEWER: 
 * From the README.md file "Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)"
 * 
 * as I understand: 
 * 1. Deposit can be only add to the Client - CLIENT only
 * 2. ...a client can't deposit more than 25% - here I understand that only CLIENT can rich this endpoint, 
 * 3. To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js - I used the once to auth & added clientOnly middleware to check if this is client
 * 
 * From deduction I don't see a reason why should handle :userId as it's coming from header.
 * @returns status 200
 */
app.post('/balances/deposit/:userId', getProfile, clientOnly, deposit)

/**
 * @returns String profession
 * 
 * @param start String startDate
 * @param end String endDate
 */
app.get('/admin/best-profession', getProfile, adminOnly, bestProffesion)

/**
 * @returns Array the clients the paid the most for jobs
 * 
 * @param start String startDate
 * @param end String endDate
 * @param limit Number limit of results (default: 2)
 */
app.get('/admin/best-clients', getProfile, adminOnly, topPayingClients)

module.exports = app;
