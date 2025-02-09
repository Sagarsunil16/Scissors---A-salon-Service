const express = require('express')
const dotenv = require('dotenv')
import cors from 'cors'
import userRoute from './routes/userRoutes'
import adminRoute from './routes/adminRoute'
import salonRoute from './routes/salonRoute'
import mongoConnect from "./config/mongoConfig"
import cookieParser = require('cookie-parser')
import { NextFunction, Request, Response } from 'express'
dotenv.config()
const app = express()
mongoConnect()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(express.urlencoded({extended:true}))
const allowedOrigins = ["http://localhost:5173"]
app.use(cors({
    origin:allowedOrigins,
    credentials:true
}))


app.use('/',userRoute)
app.use('/admin/',adminRoute)
app.use('/salon/',salonRoute)

app.listen(process.env.PORT,()=>{
    console.log(`Server is listening on ${process.env.PORT} `)
})