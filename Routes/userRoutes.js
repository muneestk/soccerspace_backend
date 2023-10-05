import express from 'express';
const userRoute = express();
import { userAuth } from '../middleware/Auth.js';
import { userRegister, userLogin, Verification, userDetails, userSave } from '../Controller/userController.js'; 


userRoute.post('/register',userRegister)
userRoute.post('/login',userLogin)
userRoute.post('/verifyUser',Verification)
userRoute.post('/userSave', userAuth, userSave)



userRoute.get('/userDetails', userAuth, userDetails)

export default userRoute