npm installconst express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!users[room]) {
      users[room] = [];
    }
    users[room].push({ username, id: socket.id });

    io.to(room).emit('updateUserList', users[room]);
    io.to(room).emit('notification', { message: `${username} has joined the chat`, timestamp: new Date().toLocaleTimeString() });

    console.log(`${username} joined room: ${room}`);
  });

  socket.on('chatMessage', ({ room, username, message, timestamp }) => {
    io.to(room).emit('message', { username, message, timestamp });
  });

  socket.on('disconnect', () => {
    if (socket.room && socket.username) {
      users[socket.room] = users[socket.room].filter(user => user.id !== socket.id);
      io.to(socket.room).emit('updateUserList', users[socket.room]);
      io.to(socket.room).emit('notification', { message: `${socket.username} has left the chat`, timestamp: new Date().toLocaleTimeString() });

      console.log(`${socket.username} left room: ${socket.room}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
