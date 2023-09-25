import express from 'express';
import { managerLogin, managerRegister, managerVerification } from '../Controller/managerController.js';
import { ManagerAuth } from '../middleware/Auth.js';
const managerRoute = express();



managerRoute.post('/register',managerRegister)
managerRoute.post('/login',managerLogin)
managerRoute.post('/verification',managerVerification)




export default managerRoute