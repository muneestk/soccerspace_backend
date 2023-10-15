import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../Files'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

export const upload = multer({
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

