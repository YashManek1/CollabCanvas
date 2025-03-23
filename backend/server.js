// backend/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("canvas-update", (data) => {
    socket.broadcast.emit("canvas-update", data); // Broadcasts elements array
    console.log("Canvas update broadcasted:", data);
  });

  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(4000, () => console.log("Server running on port 4000"));
