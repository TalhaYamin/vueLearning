const { Server } = require('socket.io');

let onlineUsers = {};
let roomMessages = {};
let rooms = ['General', 'Sports', 'Tech'];
const adminEmails = ['admin@admin.com'];

// Function to determine user role
function getUserRole(email) {
  return adminEmails.includes(email) ? 'admin' : 'member';
}

const setupSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const email = socket.handshake.query.email;
    const role = getUserRole(email);

    onlineUsers[socket.id] = { id: userId, email, role, socketId: socket.id };

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
        onlineUsers[room].push({ id: userId, email, role, socketId: socket.id });
      }

      io.to(room).emit('online users', onlineUsers[room]);
      socket.emit('room history', roomMessages[room]);
      io.to(room).emit('notification', { message: `${email} has joined the room`, room });
    });

    // Handle file sharing in rooms
    socket.on('share file', ({ room, filePath, fileName }) => {
      const message = `${fileName} was shared. Download here: ${filePath}`;
      const newMessage = {
        senderEmail: 'System',
        message: message,
        room: room,
        timestamp: new Date().toISOString()
      };

      roomMessages[room].push(newMessage);
      io.to(room).emit('room message', newMessage);
    });

    // Handle typing events
    socket.on('typing', ({ room, userEmail }) => {
      socket.to(room).emit('typing', { room, userEmail });
    });

    socket.on('stopped typing', ({ room, userEmail }) => {
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
      const newMessage = {
        senderEmail: email,
        message: message,
        room: room,
        timestamp: new Date().toISOString()
      };

      roomMessages[room].push(newMessage);
      io.to(room).emit('room message', newMessage);
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
      const userRooms = Array.from(socket.rooms).slice(1);
      userRooms.forEach(room => {
        if (onlineUsers[room]) {
          onlineUsers[room] = onlineUsers[room].filter(user => user.socketId !== socket.id);
          io.to(room).emit('online users', onlineUsers[room]);
          io.to(room).emit('notification', { message: `${email} has left the room`, room });
        }
      });

       // Remove the user from the global online users list
      delete onlineUsers[socket.id];
      console.log(`User disconnected: ${email}, Socket ID: ${socket.id}`);
    });
  });
};

module.exports = { setupSockets };
