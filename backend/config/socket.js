const jwt = require('jsonwebtoken');
const User = require('../models/User');

const rooms = new Map();

exports.setupSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = await User.findById(decoded.userId);
        return next();
      } catch (err) {
        // Allow anonymous users for public rooms
      }
    }
    socket.user = { username: `Guest_${Math.random().toString(36).substr(2, 9)}` };
    next();
  });

  io.on('connection', (socket) => {
    console.log(`⚡ ${socket.user.username} connected`);

    // Join a race room
    socket.on('join_room', ({ roomId, mode }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: new Map(),
          config: mode,
          startTime: null,
          status: 'waiting'
        });
      }
      
      const room = rooms.get(roomId);
      room.players.set(socket.id, {
        id: socket.id,
        username: socket.user.username,
        progress: 0,
        wpm: 0,
        status: 'ready'
      });
      
      // Notify room
      socket.to(roomId).emit('player_joined', {
        username: socket.user.username,
        playerCount: room.players.size
      });
      
      socket.emit('room_state', {
        players: Array.from(room.players.values()),
        config: room.config
      });
    });

    // Race progress update
    socket.on('race_progress', ({ roomId, progress, wpm }) => {
      const room = rooms.get(roomId);
      if (room?.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        player.progress = progress;
        player.wpm = wpm;
        
        socket.to(roomId).emit('player_update', {
          playerId: socket.id,
          progress,
          wpm
        });
      }
    });

    // Start race (host only)
    socket.on('start_race', (roomId) => {
      const room = rooms.get(roomId);
      if (room && room.players.has(socket.id)) {
        room.startTime = Date.now();
        room.status = 'racing';
        
        io.to(roomId).emit('race_start', {
          startTime: room.startTime,
          text: room.config.text // Would be generated server-side in production
        });
      }
    });

    // Race finished
    socket.on('race_finish', ({ roomId, results }) => {
      const room = rooms.get(roomId);
      if (room?.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        player.status = 'finished';
        
        socket.to(roomId).emit('player_finished', {
          playerId: socket.id,
          results
        });
        
        // Check if all finished
        const allFinished = Array.from(room.players.values())
          .every(p => p.status === 'finished');
        
        if (allFinished) {
          const rankings = Array.from(room.players.values())
            .sort((a, b) => b.wpm - a.wpm)
            .map((p, i) => ({ rank: i + 1, ...p }));
          
          io.to(roomId).emit('race_results', { rankings });
          room.status = 'completed';
        }
      }
    });

    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        room.players.delete(socket.id);
        socket.to(roomId).emit('player_left', {
          playerId: socket.id,
          playerCount: room.players.size
        });
        
        // Clean up empty rooms
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    });

    socket.on('disconnect', () => {
      // Clean up from all rooms
      rooms.forEach((room, roomId) => {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          socket.to(roomId).emit('player_left', {
            playerId: socket.id,
            playerCount: room.players.size
          });
          if (room.players.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
      console.log(`❌ ${socket.user.username} disconnected`);
    });
  });
};