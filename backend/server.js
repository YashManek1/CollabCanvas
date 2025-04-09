const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins; replace with specific client URL in production
    methods: ["GET", "POST"],
  },
});

const rooms = new Map(); // Track users per room

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (data) => {
    const { roomId } = data;
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Track user in room
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(socket.id);

    // Notify user they can edit
    socket.emit("collaboration-status", { canEdit: true });
  });

  socket.on("canvas-update", (data) => {
    const roomId = data.roomId || "default"; // Assume roomId is sent with data
    socket.to(roomId).emit("canvas-update", data.elements); // Broadcast only elements
    console.log(`Canvas update broadcasted to room ${roomId}:, data.elements`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from all rooms
    for (let [roomId, userSet] of rooms) {
      if (userSet.has(socket.id)) {
        userSet.delete(socket.id);
        if (userSet.size === 0) rooms.delete(roomId);
        break;
      }
    }
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));