const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { MAX_MESSAGES_IN_MEMORY } = require('./backend/config/constants');
const memoryStore = require('./backend/store/memoryStore');
const registerChatHandlers = require('./backend/sockets/chatHandlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

io.on('connection', (socket) => {
  registerChatHandlers(io, socket, memoryStore);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Ephemeral Chat running at http://localhost:${PORT}\n`);
});
