import express from 'express';
import { managerLogin, managerRegister, managerVerification, resendOtp , managerDetails, managerEdit } from '../Controller/managerController.js';
import { ManagerAuth } from '../middleware/Auth.js';
const managerRoute = express();



managerRoute.post('/register',managerRegister)
managerRoute.post('/login',managerLogin)
managerRoute.post('/verification',managerVerification)
managerRoute.post('/resendOtp',resendOtp)

managerRoute.get('/managerDetails',managerDetails)
managerRoute.patch('/saveManager',managerEdit)




export default managerRoute