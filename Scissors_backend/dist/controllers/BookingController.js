"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const stripe_1 = __importDefault(require("stripe"));
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
class BookingController {
    constructor(bookingService) {
        this._bookingService = bookingService;
        this.webHooks = this.webHooks.bind(this);
    }
    getSalonDataWithSlots(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: salonId, serviceIds, stylistIds, date } = req.query;
                const serviceIdsArray = typeof serviceIds === "string" ? serviceIds.split(",") : [];
                const response = yield this._bookingService.getSalonDataWithSlots(salonId, serviceIdsArray, stylistIds, date);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: "Salon data fetched successfully",
                    salonData: response.salonData,
                    reviews: response.reviews,
                    offers: response.offers,
                });
            }
            catch (error) {
                if (error.statusCode === HttpStatus_1.HttpStatus.BAD_REQUEST ||
                    error.statusCode === HttpStatus_1.HttpStatus.NOT_FOUND) {
                    res.status(error.statusCode).json({ message: error.message, stylists: [] });
                    return;
                }
                next(error);
            }
        });
    }
    getAvailableSlots(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { salonId, stylistId, selectedDate, serviceIds } = req.body;
                const response = yield this._bookingService.getAvailableSlots(salonId, stylistId, selectedDate, serviceIds);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: "Available slot groups fetched successfully",
                    slotGroups: response.slotGroups,
                    totalDuration: response.totalDuration,
                });
            }
            catch (error) {
                if (error.statusCode === HttpStatus_1.HttpStatus.BAD_REQUEST || error.statusCode === HttpStatus_1.HttpStatus.NOT_FOUND) {
                    res.status(error.statusCode).json({ message: error.message });
                    return;
                }
                next(error);
            }
        });
    }
    getServiceStylists(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { salonId } = req.params;
                const { serviceIds, date } = req.query;
                const serviceIdsArray = typeof serviceIds === "string" ? serviceIds.split(",") : [];
                const stylists = yield this._bookingService.getServiceStylists(salonId, serviceIdsArray, date);
                res
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({ message: Messages_1.Messages.STYLISTS_FETCHED, stylists });
            }
            catch (error) {
                if (error.statusCode === HttpStatus_1.HttpStatus.BAD_REQUEST) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
                    return;
                }
                next(error);
            }
        });
    }
    createBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { salonId, stylistId, serviceIds, slotIds, startTime, endTime, paymentMethod, serviceOption, address, } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield this._bookingService.createBooking(userId, {
                    salonId,
                    stylistId,
                    serviceIds,
                    slotIds,
                    startTime,
                    endTime,
                    paymentMethod,
                    serviceOption,
                    address,
                });
                if (result.appointment) {
                    res.status(HttpStatus_1.HttpStatus.OK).json({
                        message: "Booking created successfully",
                        appointment: result.appointment,
                    });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.OK).json({
                        message: "Slots reserved successfully",
                        reservation: result.reservation,
                    });
                }
            }
            catch (error) {
                if (error.statusCode === HttpStatus_1.HttpStatus.BAD_REQUEST ||
                    error.statusCode === HttpStatus_1.HttpStatus.NOT_FOUND ||
                    error.statusCode === HttpStatus_1.HttpStatus.CONFLICT) {
                    res.status(error.statusCode).json({ message: error.message });
                    return;
                }
                next(error);
            }
        });
    }
    createCheckoutSession(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { amount, currency, metadata, reservedUntil, bookingId } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield this._bookingService.createCheckoutSession(userId, {
                    amount,
                    currency,
                    metadata,
                    reservedUntil,
                    bookingId,
                });
                if (result.appointmentId) {
                    res.status(HttpStatus_1.HttpStatus.OK).json({
                        message: "Booking confirmed for cash payment",
                        bookingId: result.bookingId,
                        appointmentId: result.appointmentId,
                    });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.OK).json({
                        message: Messages_1.Messages.CHECKOUT_SESSION_CREATED,
                        id: result.id,
                    });
                }
            }
            catch (error) {
                if (error.statusCode) {
                    res.status(error.statusCode).json({ message: error.message });
                    return;
                }
                next(error);
            }
        });
    }
    getCheckoutSessionStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield this._bookingService.getCheckoutSessionStatus(userId, sessionId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: result.status === "confirmed"
                        ? "Booking confirmed by webhook"
                        : "Payment completed. Waiting for webhook confirmation",
                    bookingId: result.bookingId,
                    appointmentId: result.appointmentId,
                    status: result.status,
                });
            }
            catch (error) {
                if (error.statusCode) {
                    res.status(error.statusCode).json({ message: error.message });
                    return;
                }
                next(error);
            }
        });
    }
    webHooks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("✅ Stripe Webhook called!");
            const sig = req.headers["stripe-signature"];
            console.log("🔐 Signature:", sig);
            console.log("📦 Full Raw body:", req.body.toString());
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
            console.log("Stripe Webhook Secret:", endpointSecret);
            console.log("Is raw buffer?", Buffer.isBuffer(req.body));
            if (!endpointSecret) {
                throw new cutsomError_1.default(Messages_1.Messages.WEBHOOK_SERVER_ERROR, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!sig) {
                throw new cutsomError_1.default("Missing stripe-signature header", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
                console.log("Received event:", event.type, "Event ID:", event.id);
            }
            catch (error) {
                console.error("Webhook signature verification failed:", error.message);
                console.error("Full error details:", JSON.stringify(error, null, 2));
                console.error("Request headers:", JSON.stringify(req.headers, null, 2));
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
                return;
            }
            try {
                yield this._bookingService.handleWebhookEvent(event);
                res.status(HttpStatus_1.HttpStatus.OK).send();
            }
            catch (error) {
                console.error("Error handling webhook event:", error.message);
                next(error);
            }
        });
    }
}
exports.default = BookingController;
