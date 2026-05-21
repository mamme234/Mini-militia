const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

/*
IMPORTANT FIX: correct frontend path
*/
const FRONTEND_PATH = path.join(__dirname, "../frontend");

app.use(express.static(FRONTEND_PATH));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

/*
ROOMS
*/
let rooms = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", (data) => {

    const roomId = data.room || "GLOBAL";

    socket.join(roomId);
    socket.roomId = roomId;

    if (!rooms[roomId]) rooms[roomId] = {};

    rooms[roomId][socket.id] = {
      x: 500,
      y: 300,
      rotation: 0,
      name: data.name || "Player"
    };

  });

  socket.on("move", (data) => {

    const roomId = socket.roomId;

    if (rooms[roomId]?.[socket.id]) {
      rooms[roomId][socket.id].x = data.x;
      rooms[roomId][socket.id].y = data.y;
      rooms[roomId][socket.id].rotation = data.rotation;
    }

  });

  socket.on("shoot", (data) => {
    socket.to(socket.roomId).emit("playerShoot", data);
  });

  setInterval(() => {
    const roomId = socket.roomId;
    if (rooms[roomId]) {
      io.to(roomId).emit("players", rooms[roomId]);
    }
  }, 50);

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
