const { MAX_MESSAGES_IN_MEMORY } = require('../config/constants');

const activeUsers = new Map();
const chatHistory = new Map();
const roomMembers = new Map();

function addUser(socketId, username, room) {
  activeUsers.set(socketId, { username, room });
  if (!roomMembers.has(room)) roomMembers.set(room, new Set());
  roomMembers.get(room).add(socketId);
}

function removeUser(socketId) {
  const user = activeUsers.get(socketId);
  if (!user) return null;
  activeUsers.delete(socketId);
  const members = roomMembers.get(user.room);
  if (members) {
    members.delete(socketId);
    if (members.size === 0) roomMembers.delete(user.room);
  }
  return user;
}

function getUser(socketId) {
  return activeUsers.get(socketId) || null;
}

function getRoomUsers(room) {
  const members = roomMembers.get(room);
  if (!members) return [];
  return Array.from(members).map(id => ({
    socketId: id,
    ...activeUsers.get(id),
  })).filter(Boolean);
}

function addMessage(room, message) {
  if (!chatHistory.has(room)) chatHistory.set(room, []);
  const history = chatHistory.get(room);
  history.push(message);
  if (history.length > MAX_MESSAGES_IN_MEMORY) history.shift();
}

function getRoomHistory(room) {
  return chatHistory.get(room) || [];
}

function getAllRooms() {
  return Array.from(roomMembers.keys()).map(room => ({
    room,
    count: roomMembers.get(room).size,
  }));
}

module.exports = {
  addUser, removeUser, getUser,
  getRoomUsers, addMessage, getRoomHistory, getAllRooms,
};
