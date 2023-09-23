import express from 'express';
import { managerLogin, managerRegister, managerVerification } from '../Controller/managerController.js';
const managerRoute = express();



managerRoute.post('/register',managerRegister)
managerRoute.post('/login',managerLogin)
managerRoute.post('/verification',managerVerification)




export default managerRoute