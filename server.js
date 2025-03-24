const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

// 存储所有玩家信息
const players = {}
// 存储所有气球信息
const gameBalloons = []

// 提供静态文件
app.use(express.static("public")) // public 目录存放 index.html, script.js 等文件

// Socket.io 连接处理
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id)

  // 新玩家加入
  players[socket.id] = {
    id: socket.id,
    score: 0,
  }

  // 广播新玩家加入
  io.emit("playerJoined", players[socket.id])

  // 发送当前所有玩家信息给新玩家
  socket.emit("currentPlayers", players)

  // 发送当前所有气球信息给新玩家
  socket.emit("currentBalloons", gameBalloons)

  // 玩家射击
  socket.on("playerShot", (balloonId) => {
    // 查找气球
    const balloonIndex = gameBalloons.findIndex((b) => b.id === balloonId)

    if (balloonIndex !== -1) {
      // 移除气球
      const balloon = gameBalloons.splice(balloonIndex, 1)[0]

      // 更新玩家分数
      players[socket.id].score++

      // 广播气球被击中
      io.emit("balloonPopped", {
        balloonId: balloonId,
        playerId: socket.id,
        playerScore: players[socket.id].score,
      })

      // 创建新气球
      createNewBalloon()
    }
  })

  // 玩家断开连接
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id)

    // 移除玩家
    delete players[socket.id]

    // 广播玩家离开
    io.emit("playerLeft", socket.id)
  })
})

// 创建新气球
function createNewBalloon() {
  const newBalloon = {
    id: Date.now().toString(),
    position: {
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 5 - 2,
      z: -Math.random() * 10 - 5,
    },
  }

  gameBalloons.push(newBalloon)

  // 广播新气球
  io.emit("newBalloon", newBalloon)
}

// 初始化一些气球
for (let i = 0; i < 5; i++) {
  createNewBalloon()
}

// 启动服务器
const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

