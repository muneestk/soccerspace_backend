import express from 'express';
import { managerLogin, managerRegister, managerVerification, resendOtp, managerDetails, managerEdit, addTournment } from '../Controller/managerController.js';
import { ManagerAuth } from '../middleware/Auth.js';
import multer from 'multer';
import { fileURLToPath } from 'url'; // Import the 'fileURLToPath' function
import path from 'path';

const __filename = fileURLToPath(import.meta.url); // Get the current module's filename
const __dirname = path.dirname(__filename); // Get the directory name

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
        fileSize: 1024 * 1024 * 10, // Set the maximum file size (e.g., 10MB)
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

managerRoute.post('/register', managerRegister);
managerRoute.post('/login', managerLogin);
managerRoute.post('/verification', managerVerification);
managerRoute.post('/resendOtp', resendOtp);
managerRoute.post('/addTournment', upload.fields([{ name: 'logoImage' }, { name: 'posterImage' }]), addTournment);
managerRoute.get('/managerDetails', managerDetails);
managerRoute.patch('/saveManager', managerEdit);

export default managerRoute;
