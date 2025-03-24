const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Store players and balloons data
const players = {};
const gameBalloons = [];

// Serve static files from the public folder
app.use(express.static("public"));

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Add new player
  players[socket.id] = {
    id: socket.id,
    score: 0,
  };

  // Broadcast new player joining
  io.emit("playerJoined", players[socket.id]);

  // Send current players to the new player
  socket.emit("currentPlayers", players);

  // Send current balloons to the new player
  socket.emit("currentBalloons", gameBalloons);

  // Handle player shooting
  socket.on("playerShot", (balloonId) => {
    const balloonIndex = gameBalloons.findIndex((b) => b.id === balloonId);
    if (balloonIndex !== -1) {
      const balloon = gameBalloons.splice(balloonIndex, 1)[0];
      players[socket.id].score++;
      io.emit("balloonPopped", {
        balloonId: balloonId,
        playerId: socket.id,
        playerScore: players[socket.id].score,
      });
      createNewBalloon();
    }
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
    delete players[socket.id];
    io.emit("playerLeft", socket.id);
  });
});

// Create new balloon and broadcast it
function createNewBalloon() {
  const newBalloon = {
    id: Date.now().toString(),
    position: {
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 5 - 2,
      z: -Math.random() * 10 - 5,
    },
  };

  gameBalloons.push(newBalloon);
  io.emit("newBalloon", newBalloon);
}

// Initialize some balloons
for (let i = 0; i < 5; i++) {
  createNewBalloon();
}

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
