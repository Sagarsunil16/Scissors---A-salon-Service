const express = require('express')
const dotenv = require('dotenv')
import cors from 'cors'
import userRoute from './routes/userRoutes'
import adminRoute from './routes/adminRoute'
import salonRoute from './routes/salonRoute'
import authRoute from './routes/authRoute'
import mongoConnect from "./config/mongoConfig"
import cookieParser = require('cookie-parser')
dotenv.config()
const app = express()
mongoConnect()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const allowedOrigins = ["http://localhost:5173"]
app.use(cors({
    origin:allowedOrigins,
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allowed request methods
}))


app.use('/',userRoute)
app.use('/admin/',adminRoute)
app.use('/salon/',salonRoute)
app.use('/auth/',authRoute)

app.listen(process.env.PORT,()=>{
    console.log(`Server is listening on ${process.env.PORT} `)
})