const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000','http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    try {
      let roomParticipants = rooms.get(roomId) || new Set();

      if (roomParticipants.size >= 2) {
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);
      roomParticipants.add(socket.id);
      rooms.set(roomId, roomParticipants);

      roomParticipants.forEach(participant => {
        if (participant !== socket.id) {
          socket.to(participant).emit('user-joined', socket.id);
        }
      });

      socket.emit('existing-users', Array.from(roomParticipants)
        .filter(id => id !== socket.id));
        
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('signal', ({ to, signal }) => {
    socket.to(to).emit('signal', { from: socket.id, signal });
  });

  socket.on('disconnect', () => {
    rooms.forEach((participants, roomId) => {
      if (participants.delete(socket.id)) {
        socket.to(roomId).emit('user-left', socket.id);
        if (participants.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => 
  console.log(`Signaling server running on port ${PORT}`));