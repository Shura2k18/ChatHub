import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import userRouter from "./router/user-router.js"
import chatroomRouter from "./router/chatroom-router.js"
import messageRouter from "./router/message-router.js"
import authRouter from "./router/auth-router.js"
import errorMiddleware from "./middlewares/error-middleware.js"
import startSocket from "./WebSocket/websocket.js"
import redisAdapter from "socket.io-redis"
import redis from "redis"
import path from "path"

//Create server
const PORT = process.env.PORT || 5000
const app = express()

export const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  },
})
redisClient.on("error", (err) => console.log("Redis Client Error", err))
;(async () => {
  await redisClient.connect().then(console.log("Подключено к Redis"))
})()

//Middlewares
app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: "*",
  }),
)
// app.use(upload.single('imageUrl'))
app.use("/api/uploads", express.static("uploads"))
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/chatroom", chatroomRouter)
app.use("/api/message", messageRouter)
app.use(errorMiddleware)

//Server start function
const start = async () => {
  try {
    //Сonnecting to mongo
    await mongoose
      .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Mongo has connected successfully"))
      .catch((err) => console.log("Mongo connection has an error", err))

    //Start server
    const server = app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server started on PORT = ${PORT}`),
    )
    startSocket(server)
  } catch (e) {
    console.log(e)
  }
}

start()
