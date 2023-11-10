import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import { createServer } from 'http';
const http = createServer(app);
import userRoute from './Routes/userRoutes.js';
import managerRoute from './Routes/managerRoute.js';
import adminRoute from './Routes/adminRoute.js';
import { Server } from 'socket.io';


dotenv.config();


app.use(cors({
    credentials:true,
    origin:['http://localhost:4200','https://soccerspace-frontent-mfub.vercel.app']
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
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Database connected successfully');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

 const server = http.listen(process.env.PORT,()=>{
    console.log("Server started listening to port");
});


const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origins:[ "http://localhost:4200","https://soccerspace-frontent-mfub.vercel.app"]
    }
});

io.on('connection', (socket) => {
    socket.on('setup', (id) => {    
        console.log('a user connected');
    });

    socket.on('join', (room) => {
        socket.join(room);
        socket.to(room).emit('emit-joined')
    });

    socket.on('chatMessage', (message) => {
        io.to(message.connection).emit("messageRecieved", message);
   
    });

    socket.on('disconnect', () => {
        console.log(socket);
        console.log('user is disconnected');
    });
});
    

  