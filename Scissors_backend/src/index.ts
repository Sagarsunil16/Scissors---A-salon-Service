const express = require('express')
const dotenv = require('dotenv')
import http from 'http'
import {initializeSocket} from './socket'
import cors from 'cors'
import mainRouter from './routes/index'
import mongoConnect from "./config/mongoConfig"
import cookieParser = require('cookie-parser')
import logger from './Utils/logger'
import morgan from 'morgan'
dotenv.config()
const app = express()
const server = http.createServer(app)
mongoConnect()

// Initialize Socket.io
app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())  // log to winston
    }
  }));
  
const io = initializeSocket(server)
app.use("/uploads", express.static("uploads"));
app.use('/webhook', express.raw({ type: 'application/json' })); 
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const allowedOrigins = ["http://localhost:5173"]
app.use(cors({
    origin:allowedOrigins,
    credentials:true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}))


app.use(mainRouter);
server.listen(process.env.PORT,()=>{
    console.log(`Server is listening on ${process.env.PORT} `)
})