import express from 'express';
const userRoute = express();
import { userAuth } from '../middleware/Auth.js';
import { userRegister, userLogin, Verification, userDetails, userSave, googleRegister, teamRegister, verifyPayment, forgotMailSent, forgotPassword, reverificationMailSent, myTournaments, myTournamentsTeams, tournamentData, Searchtournament, filtertournament } from '../Controller/userController.js'; 
import { upload } from '../middleware/multer.js';
import { chatConnection } from '../Controller/chatController.js';

userRoute.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      next();
    }
  });


userRoute.post('/register',userRegister)
userRoute.post('/googleLogin',googleRegister)
userRoute.post('/login',userLogin)
userRoute.post('/verifyUser',Verification)
userRoute.post('/forgotMailSent',forgotMailSent)
userRoute.post('/reVerifyAccount',reverificationMailSent)
userRoute.post('/userSave', userAuth, userSave)
userRoute.post('/verifyPayment', userAuth, verifyPayment)
userRoute.post('/registerTournament', userAuth,upload.single('logoImage'), teamRegister)


userRoute.post('/chatConnect', chatConnection)

userRoute.patch('/forgotPassword',forgotPassword) 




userRoute.get('/userDetails', userAuth, userDetails)
userRoute.get('/allTournaments', userAuth, tournamentData)
userRoute.get('/myTournaments', userAuth, myTournaments)
userRoute.get('/myTournamentsTeams', userAuth, myTournamentsTeams)
userRoute.get('/searchTournaments', userAuth, Searchtournament)
userRoute.get('/filterPlayers', userAuth, filtertournament)

export default userRoute