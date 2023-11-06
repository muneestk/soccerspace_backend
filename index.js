import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
const app = express();
import { createServer } from 'http';
const http = createServer(app);
import userRoute from './Routes/userRoutes.js';
import managerRoute from './Routes/managerRoute.js';
import adminRoute from './Routes/adminRoute.js';
import initializeSocket  from './Socket/socketio.js';

dotenv.config();
const io = new Server(http);


app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}));

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use((req,res,next) =>{
    res.header("Cache-Control", "no-cache,no-store,must-revalidate");
    next();
});



app.use('/files',express.static('Files'));
app.use('/',userRoute);
app.use('/admin',adminRoute);
app.use('/manager',managerRoute);


mongoose.connect(process.env.MONGO, {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() =>{
    console.log('database connected succesfully');
});


 const server = http.listen(process.env.PORT,()=>{
    console.log("Server started listening to port");
});

initializeSocket(server)


  