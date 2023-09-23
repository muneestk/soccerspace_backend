import express from 'express';
const userRoute = express();
import { userRegister,userLogin, Verification } from '../Controller/userController.js'; 


userRoute.post('/register',userRegister)
userRoute.post('/login',userLogin)
userRoute.post('/verifyUser',Verification)

export default userRoute