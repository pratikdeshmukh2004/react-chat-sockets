const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./Services/users.js");
const {
  getmessagesInRoom,
  addMessage,
  removeMessagesFromRoom,
} = require("./Services/messages.js");

app.use(cors());
io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    room = room.toLowerCase();
    const user = addUser({ id: socket.id, name, room });
    console.log(user);
    if (Object.keys(user).includes('error')) return callback(user);
    const old_chats = getmessagesInRoom(room);
    if (old_chats.length == 0) {
      socket.emit("message", {
        user: "admin",
        text: `${user.name} welcome to the room ${user.room}`,
      });
    } else {
      socket.emit("old_chats", getmessagesInRoom(room));
    }
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    addMessage({ room: user.room, text: message, user: user.name });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      if (getUsersInRoom(user.room).length == 0) {
        removeMessagesFromRoom(user.room);
      }
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
