// server.js

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const MAX_USERS = 2
const rooms = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = new Set()
    }
    
    if (rooms[roomId].size >= MAX_USERS) {
      socket.emit('room-full')
      return;
    }
    
    rooms[roomId].add(userId)
    socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        rooms[roomId].delete(userId)
        if (rooms[roomId].size === 0) {
          delete rooms[roomId]
        } else {  
          socket.to(roomId).emit('user-disconnected', userId);
        }
      });

      // Handle mute state changes
      socket.on('mute-state-changed', ({ userId, isMuted }) => {
          socket.to(roomId).emit('mute-state-changed', { userId, isMuted });
      });
  });
});

server.listen(3000)
