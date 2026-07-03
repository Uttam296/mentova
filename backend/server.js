const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/mentorship', require('./routes/mentorship'));
app.use('/api/ai', require('./routes/ai'));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mentova';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Socket.IO for real-time chat
const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers[userId] = socket.id;
    socket.userId = userId;
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, message } = data;
    const Message = require('./models/Message');
    const newMsg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: message,
      timestamp: new Date()
    });
    const recipientSocket = activeUsers[receiverId];
    if (recipientSocket) {
      io.to(recipientSocket).emit('receiveMessage', newMsg);
    }
    socket.emit('messageSent', newMsg);
  });

  socket.on('disconnect', () => {
    if (socket.userId) delete activeUsers[socket.userId];
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
