const SocketClient = (() => {
  let socket = null;
  const handlers = {};

  function connect() {
    socket = io();
    ['message','system_message','history','user_joined',
     'user_left','typing','rooms_update','error'].forEach(event => {
      socket.on(event, (data) => { if (handlers[event]) handlers[event](data); });
    });
  }

  function on(event, fn) { handlers[event] = fn; }
  function join(username, room) { socket.emit('join', { username, room }); }
  function sendMessage(text) { socket.emit('message', { text }); }
  function sendTyping(isTyping) { socket.emit('typing', { isTyping }); }
  function disconnect() { if (socket) socket.disconnect(); }

  return { connect, on, join, sendMessage, sendTyping, disconnect };
})();
