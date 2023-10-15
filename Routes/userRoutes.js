import express from 'express';
const userRoute = express();
import { userAuth } from '../middleware/Auth.js';
import { userRegister, userLogin, Verification, userDetails, userSave, googleRegister, teamRegister } from '../Controller/userController.js'; 
import { upload } from '../middleware/multer.js';
    


userRoute.post('/register',userRegister)
userRoute.post('/googleLogin',googleRegister)
userRoute.post('/login',userLogin)
userRoute.post('/verifyUser',Verification)
userRoute.post('/userSave', userAuth, userSave)
userRoute.post('/registerTournament', userAuth,upload.single('logoImage'), teamRegister)



userRoute.get('/userDetails', userAuth, userDetails)

export default userRoute