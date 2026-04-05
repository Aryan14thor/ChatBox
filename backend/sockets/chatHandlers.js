const { MAX_USERNAME_LENGTH, MAX_MESSAGE_LENGTH, MAX_ROOM_NAME_LENGTH } = require('../config/constants');

function registerChatHandlers(io, socket, store) {

  socket.on('join', ({ username, room }) => {
    username = String(username || '').trim().slice(0, MAX_USERNAME_LENGTH);
    room     = String(room     || '').trim().slice(0, MAX_ROOM_NAME_LENGTH) || 'general';
    if (!username) { socket.emit('error', { message: 'Username is required.' }); return; }

    const prev = store.getUser(socket.id);
    if (prev) {
      socket.leave(prev.room);
      store.removeUser(socket.id);
      io.to(prev.room).emit('user_left', { username: prev.username, users: store.getRoomUsers(prev.room) });
    }

    store.addUser(socket.id, username, room);
    socket.join(room);
    socket.emit('history', store.getRoomHistory(room));

    const systemMsg = { type: 'system', text: `${username} joined the room`, timestamp: Date.now() };
    store.addMessage(room, systemMsg);
    io.to(room).emit('system_message', systemMsg);
    io.to(room).emit('user_joined', { username, users: store.getRoomUsers(room) });
    io.emit('rooms_update', store.getAllRooms());
  });

  socket.on('message', ({ text }) => {
    const user = store.getUser(socket.id);
    if (!user) return;
    text = String(text || '').trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) return;
    const msg = { type: 'chat', username: user.username, text, timestamp: Date.now(), socketId: socket.id };
    store.addMessage(user.room, msg);
    io.to(user.room).emit('message', msg);
  });

  socket.on('typing', ({ isTyping }) => {
    const user = store.getUser(socket.id);
    if (!user) return;
    socket.to(user.room).emit('typing', { username: user.username, isTyping });
  });

  socket.on('disconnect', () => {
    const user = store.removeUser(socket.id);
    if (!user) return;
    const systemMsg = { type: 'system', text: `${user.username} left the room`, timestamp: Date.now() };
    store.addMessage(user.room, systemMsg);
    io.to(user.room).emit('system_message', systemMsg);
    io.to(user.room).emit('user_left', { username: user.username, users: store.getRoomUsers(user.room) });
    io.emit('rooms_update', store.getAllRooms());
  });
}

module.exports = registerChatHandlers;
