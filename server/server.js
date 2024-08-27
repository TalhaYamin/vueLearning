const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
}));

// Configure CORS for Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

let onlineUsers = {}; // Store online users by room
let roomMessages = {}; // Store messages by room
let rooms = ['General', 'Sports', 'Tech']; // Default rooms

// Hardcoded user roles for simplicity
const adminEmails = ['admin@admin.com']; // Admin users list

// Function to determine role
function getUserRole(email) {
    return adminEmails.includes(email) ? 'admin' : 'member';
}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const email = socket.handshake.query.email;
    const role = getUserRole(email);

    console.log(`User connected: ${email}, Role: ${role}, Socket ID: ${socket.id}`);

    // Send initial room list
    socket.emit('room list', rooms);

    // Handle room joining
    socket.on('join room', (room) => {
        console.log(`${email} is attempting to join room: ${room}`);

        socket.join(room);

        if (!onlineUsers[room]) {
            onlineUsers[room] = [];
        }

        if (!roomMessages[room]) {
            roomMessages[room] = [];
        }

        if (!onlineUsers[room].find(user => user.id === userId)) {
            onlineUsers[room].push({ id: userId, email, role });
        }

        socket.emit('room history', roomMessages[room]);

        io.to(room).emit('notification', { message: `${email} has joined the room`, room });
        io.to(room).emit('online users', onlineUsers[room]);
    });

    socket.on('typing', ({ room, userEmail }) => {
        console.log(`${userEmail} is typing in room ${room}`);
        socket.to(room).emit('typing', { room, userEmail });
    });
    
    socket.on('stopped typing', ({ room, userEmail }) => {
        console.log(`${userEmail} stopped typing in room ${room}`);
        socket.to(room).emit('stopped typing', { room, userEmail });
    });

    // Handle admin actions: Create/Delete Room
    socket.on('create room', (newRoom) => {
        if (role !== 'admin') {
            socket.emit('error', { message: 'Only admins can create rooms' });
            return;
        }

        if (!rooms.includes(newRoom)) {
            rooms.push(newRoom);
            io.emit('room list', rooms);
            console.log(`Room created: ${newRoom}`);
        }
    });

    socket.on('delete room', (roomToDelete) => {
        if (role !== 'admin') {
            socket.emit('error', { message: 'Only admins can delete rooms' });
            return;
        }

        if (rooms.includes(roomToDelete)) {
            rooms = rooms.filter(room => room !== roomToDelete);
            delete roomMessages[roomToDelete];
            delete onlineUsers[roomToDelete];
            io.emit('room list', rooms);
            console.log(`Room deleted: ${roomToDelete}`);
        }
    });

    // Handle banning users
    socket.on('ban user', ({ userEmail, room }) => {
        if (role !== 'admin') {
            socket.emit('error', { message: 'Only admins can ban users' });
            return;
        }

        const userSocket = Array.from(io.sockets.sockets.values()).find(s => s.handshake.query.email === userEmail);

        if (userSocket && room) {
            userSocket.leave(room);
            io.to(room).emit('notification', { message: `${userEmail} was banned by admin`, room });
        }
    });

    // Handle room messages
    socket.on('room message', ({ room, message }) => {
        console.log(`Message to room "${room}" from ${email}: ${message}`);

        const newMessage = {
            senderEmail: email,
            message: message,
            room: room,
            timestamp: new Date().toISOString() // Add a timestamp to each message
        };

        roomMessages[room].push(newMessage);
        io.to(room).emit('room message', newMessage);
    });

    // Handle user disconnecting
    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms).slice(1);
        rooms.forEach(room => {
            onlineUsers[room] = onlineUsers[room].filter(user => user.id !== userId);
            io.to(room).emit('notification', { message: `${email} has left the room`, room });
            io.to(room).emit('online users', onlineUsers[room]);
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
