import { Server } from 'socket.io';

function initializeSocket(server) {
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: "http://localhost:4200"
        }
    });

    io.on('connection', (socket) => {
        socket.on('setup', (id) => {
            socket.join(id);
            socket.emit('connected');
            console.log('a user connected');
        });

        socket.on('join', (room) => {
            console.log(room,'join');
            socket.join(room);
        });

        socket.on('chatMessage', (message) => {
            console.log(message,'in socket');
            io.to(message.to).emit("messageReceived", message);
        });

        socket.on('disconnect', () => {
            console.log('user is disconnected');
        });
    });
}

export default initializeSocket;
