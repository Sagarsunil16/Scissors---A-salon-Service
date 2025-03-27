const express = require('express')
const dotenv = require('dotenv')
import cors from 'cors'
import mainRouter from './routes/index'
import mongoConnect from "./config/mongoConfig"
import cookieParser = require('cookie-parser')
dotenv.config()
const app = express()
mongoConnect()



app.use('/webhook', express.raw({ type: 'application/json' })); 
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const allowedOrigins = ["http://localhost:5173"]
app.use(cors({
    origin:allowedOrigins,
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allowed request methods
}))


app.use(mainRouter);
app.listen(process.env.PORT,()=>{
    console.log(`Server is listening on ${process.env.PORT} `)
})