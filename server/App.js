const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true
    }
});

let waitingUsers = [];

app.get('/', (req, res) => {
    res.send('Server is running');
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    waitingUsers.push(socket);
    console.log(`Current waiting users: ${waitingUsers.length}`);

    if (waitingUsers.length % 2 === 0) {
        const user1 = waitingUsers.shift();
        const user2 = waitingUsers.shift();

        user1.emit('start-call', { to: user2.id });
        user2.emit('start-call', { to: user1.id });
    }

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        waitingUsers = waitingUsers.filter(user => user !== socket);
    });

    socket.on('call-user', (data) => {
        socket.to(data.to).emit('call-made', {
            signal: data.signal,
            from: socket.id
        });
    });

    socket.on('answer-call', (data) => {
        socket.to(data.to).emit('call-accepted', {
            signal: data.signal,
            from: socket.id
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
