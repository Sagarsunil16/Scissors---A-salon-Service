"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const mongoConfig_1 = __importDefault(require("./config/mongoConfig"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = __importDefault(require("./Utils/logger"));
const morgan_1 = __importDefault(require("morgan"));
const cutsomError_1 = __importDefault(require("./Utils/cutsomError"));
const webhookRouter_1 = __importDefault(require("./routes/webhookRouter"));
const HttpStatus_1 = require("./constants/HttpStatus");
const di_1 = require("./container/di");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, mongoConfig_1.default)();
di_1.expiredReservations.start();
logger_1.default.info("ExpiredReservationsJob started");
// Morgan logging
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => logger_1.default.info(message.trim()),
    },
}));
// Initialize Socket.io
const io = (0, socket_1.initializeSocket)(server);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
// Webhook route (must come before express.json())
app.use("/webhook", webhookRouter_1.default);
// Static files and other middleware
app.use("/uploads", express_1.default.static("uploads"));
app.use(express_1.default.json()); // Moved after webhook route
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const allowedOrigins = [
    "http://localhost:5173",
    "https://scissors-a-salon-service-git-main-sagarsunil16s-projects.vercel.app",
    "https://scissors-a-salon-service.vercel.app",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log("Origin request from:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
}));
// Routes
app.use(index_1.default);
// Error-handling middleware
app.use(((error, req, res, next) => {
    if (error instanceof cutsomError_1.default) {
        logger_1.default.error(`Error: ${error.message}, Status: ${error.statusCode}`);
        return res.status(error.statusCode).json({
            message: error.message,
            error: error.message,
        });
    }
    logger_1.default.error(`Unexpected Error: ${error.message}, Stack: ${error.stack}`);
    res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "An unexpected error occurred. Please try again later.",
        error: "An unexpected error occurred. Please try again later.",
    });
}));
server.listen(process.env.PORT, () => {
    logger_1.default.info(`Server is listening on port ${process.env.PORT}`);
});
process.on("SIGINT", () => {
    di_1.expiredReservations.stop();
    logger_1.default.info("ExpiredReservationsJob stopped");
    process.exit(0);
});
