const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const users = new Set();
const messages = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (username) => {
    users.add(username);
    socket.username = username;
    io.emit("userJoined", username);
    socket.emit("chatHistory", messages);
  });

  socket.on("sendMessage", (message) => {
    const newMessage = {
      username: socket.username,
      text: message,
      timestamp: new Date(),
    };
    messages.push(newMessage);
    io.emit("message", newMessage);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      users.delete(socket.username);
      io.emit("userLeft", socket.username);
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
