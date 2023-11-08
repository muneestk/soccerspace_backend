import express from 'express';
import { managerLogin, managerRegister, managerVerification, resendOtp, managerDetails, managerEdit, addTournment, forgotMailSentManager, registerTeams, googleRegister} from '../Controller/managerController.js';
import { ManagerAuth } from '../middleware/Auth.js';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import { fetchingScorecard, fixtureFetching, roundUpdate, scoreUpdate } from '../Controller/fixtureController.js';
import { getManagerChatLIst, getManagerFullChat, sentMessage } from '../Controller/chatController.js';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const managerRoute = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../Files'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, 
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/jpeg' ||
            file.mimetype == 'image/webp'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('only .png, .jpg, .jpeg, .webp format is allowed'));
        }
    },
});

managerRoute.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      next();
    }
  });

managerRoute.post('/forgotMailSent',forgotMailSentManager)
managerRoute.post('/reVerifyAccount',forgotMailSentManager)
managerRoute.post('/register', managerRegister);
managerRoute.post('/login', managerLogin);
managerRoute.post('/verification', managerVerification);
managerRoute.post('/googleLogin', googleRegister);
managerRoute.post('/resendOtp', resendOtp);
managerRoute.post('/updateRound',ManagerAuth, roundUpdate);
managerRoute.post('/addTournment',ManagerAuth, upload.fields([{ name: 'logoImage' }, { name: 'posterImage' }]), addTournment);

managerRoute.get('/managerDetails',ManagerAuth, managerDetails);
managerRoute.get('/getFixture', fixtureFetching);
managerRoute.get('/registeredTeams',ManagerAuth, registerTeams);
managerRoute.get('/getGoalScorers/:id',ManagerAuth, fetchingScorecard);


managerRoute.get('/getChatLIst',ManagerAuth, getManagerChatLIst)
managerRoute.get('/getFullChat',ManagerAuth, getManagerFullChat)
managerRoute.post('/sentMessage',ManagerAuth, sentMessage)



managerRoute.patch('/saveManager',ManagerAuth, managerEdit);
managerRoute.patch('/updateScore',ManagerAuth, scoreUpdate);

export default managerRoute;
