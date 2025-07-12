import 'reflect-metadata'
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http";
import { initializeSocket } from "./socket";
import cors from "cors";
import mainRouter from "./routes/index";
import mongoConnect from "./config/mongoConfig";
import cookieParser from "cookie-parser";
import logger from "./Utils/logger";
import morgan from "morgan";
import CustomError from "./Utils/cutsomError";
import { HttpStatus } from "./constants/HttpStatus";
import { bookingController, expiredReservations } from "./container/di";

dotenv.config();

const app = express();
const server = http.createServer(app);

mongoConnect();
expiredReservations.start();
logger.info("ExpiredReservationsJob started");

// Morgan logging
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Initialize Socket.io
const io = initializeSocket(server);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  bookingController.webHooks.bind(bookingController)
);

app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173","https://www.scissors.hair","https://scissors.hair"];
app.use(
  cors({
   origin: (origin, callback) => {
      console.log("Origin request from:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);

// Routes
app.use(mainRouter);

// Error-handling middleware
app.use(((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof CustomError) {
    logger.error(`Error: ${error.message}, Status: ${error.statusCode}`);
    return res.status(error.statusCode).json({ error: error.message });
  }

  logger.error(`Unexpected Error: ${error.message}, Stack: ${error.stack}`);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: "An unexpected error occurred. Please try again later.",
  });
}) as express.ErrorRequestHandler);

server.listen(process.env.PORT, () => {
  logger.info(`Server is listening on port ${process.env.PORT}`);
});

process.on("SIGINT", () => {
  expiredReservations.stop();
  logger.info("ExpiredReservationsJob stopped");
  process.exit(0);
});