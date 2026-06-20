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
const IAppointment_1 = require("../Interfaces/Appointment/IAppointment");
const Appointment_1 = __importDefault(require("../models/Appointment"));
const mongoose_1 = __importDefault(require("mongoose"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const stripe_1 = __importDefault(require("stripe"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const nano_1 = require("../Utils/nano");
class BookingService {
    constructor(timeSlotService, salonService, offerService, reviewService, appointmentService, walletService) {
        this._timeSlotService = timeSlotService;
        this._salonService = salonService;
        this._offerService = offerService;
        this._reviewService = reviewService;
        this._appointmentService = appointmentService;
        this._walletService = walletService;
    }
    getSalonDataWithSlots(salonId, serviceIds, stylistId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId) {
                throw new cutsomError_1.default("Salon ID is required", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonService.getSalonData(salonId);
            if (!salon) {
                throw new cutsomError_1.default("Salon not found", HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const reviews = yield this._reviewService.getSalonReviews(salonId);
            const offers = yield this._offerService.getSalonOffer(salonId);
            return {
                salonData: salon,
                reviews,
                offers,
            };
        });
    }
    getServiceStylists(salonId, serviceIds, selectedDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId) {
                throw new cutsomError_1.default("Salon ID is required", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (!serviceIds || !Array.isArray(serviceIds)) {
                throw new cutsomError_1.default("Service IDs are required and must be an array", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonService.getSalonData(salonId);
            if (!salon) {
                throw new cutsomError_1.default("Salon not found", HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const services = salon.services.filter((service) => serviceIds.includes(service._id.toString()));
            if (services.length === 0) {
                throw new cutsomError_1.default("No valid services found", HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const selectedDay = selectedDate
                ? (0, moment_timezone_1.default)(selectedDate).format("dddd")
                : null;
            const stylistsMap = new Map();
            services.forEach((service) => {
                service.stylists.forEach((stylist) => {
                    const stylistId = stylist._id.toString();
                    if (!stylistsMap.has(stylistId)) {
                        stylistsMap.set(stylistId, {
                            _id: stylistId,
                            name: stylist.name,
                            rating: stylist.rating,
                            serviceCount: 0,
                            workingHours: stylist.workingHours,
                        });
                    }
                    const stylistData = stylistsMap.get(stylistId);
                    stylistData.serviceCount += 1;
                });
            });
            let stylists = Array.from(stylistsMap.values()).filter((stylist) => stylist.serviceCount === serviceIds.length);
            if (selectedDay) {
                stylists = stylists.filter((stylist) => stylist.workingHours.some((wh) => wh.day.toLowerCase() === selectedDay.toLowerCase()));
            }
            if (stylists.length === 0) {
                return [];
            }
            return stylists;
        });
    }
    getAvailableSlots(salonId, stylistId, selectedDate, serviceIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId || !stylistId || !selectedDate || !(serviceIds === null || serviceIds === void 0 ? void 0 : serviceIds.length)) {
                throw new cutsomError_1.default("Missing required parameters", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonService.getSalonData(salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const stylistExists = salon.services.some((service) => service.stylists.some((s) => s._id.toString() === stylistId));
            if (!stylistExists) {
                throw new cutsomError_1.default("Stylist does not belong to this salon", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const timeZone = salon.timeZone || "Asia/Kolkata";
            const date = moment_timezone_1.default.tz(selectedDate, "YYYY-MM-DD", timeZone).startOf("day").toDate();
            if (!(0, moment_timezone_1.default)(selectedDate, "YYYY-MM-DD", true).isValid()) {
                throw new cutsomError_1.default("Invalid selected date", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (moment_timezone_1.default.tz(selectedDate, "YYYY-MM-DD", timeZone).isBefore(moment_timezone_1.default.tz(timeZone).startOf("day"))) {
                throw new cutsomError_1.default("Selected date cannot be in the past", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const slotGroups = yield this._timeSlotService.findAvailableSlots(salonId, serviceIds, date, stylistId);
            const totalDuration = salon.services
                .filter((s) => serviceIds.includes(s._id.toString()))
                .reduce((sum, s) => sum + (s.duration || 30), 0);
            const formattedSlotGroups = slotGroups.map(group => ({
                _id: group._id,
                slotIds: group.slotIds,
                startTime: (0, moment_timezone_1.default)(group.startTime).tz(timeZone).toISOString(),
                endTime: (0, moment_timezone_1.default)(group.endTime).tz(timeZone).toISOString(),
                duration: group.duration
            }));
            return {
                slotGroups: formattedSlotGroups,
                totalDuration
            };
        });
    }
    createBooking(userId, bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const { salonId, stylistId, serviceIds, slotIds, startTime, endTime, paymentMethod, serviceOption, address, } = bookingData;
            if (!salonId ||
                !stylistId ||
                !(serviceIds === null || serviceIds === void 0 ? void 0 : serviceIds.length) ||
                !(slotIds === null || slotIds === void 0 ? void 0 : slotIds.length) ||
                !startTime ||
                !endTime ||
                !paymentMethod ||
                !serviceOption) {
                throw new cutsomError_1.default("Missing required parameters", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (serviceOption !== "home" && serviceOption !== "store") {
                throw new cutsomError_1.default("Service option must be 'home' or 'store'", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonService.getSalonData(salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const validServices = salon.services.filter((service) => serviceIds.includes(service._id.toString()) &&
                service.stylists.some((s) => s._id.toString() === stylistId));
            if (validServices.length !== serviceIds.length) {
                throw new cutsomError_1.default("Invalid services or stylist-service mismatch", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const totalDuration = validServices.reduce((sum, service) => sum + (service.duration || 30), 0);
            let totalPrice = validServices.reduce((sum, service) => sum + (service.price || 0), 0);
            if (serviceOption === "home") {
                totalPrice += 99;
            }
            const slotDuration = slotIds.length * 30;
            if (slotDuration < totalDuration) {
                throw new cutsomError_1.default("Selected slots do not cover service duration", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const bookingId = (0, nano_1.nanoid)();
            const serviceObjectIds = serviceIds.map(id => {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new cutsomError_1.default(`Invalid service ID: ${id}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                return new mongoose_1.default.Types.ObjectId(id);
            });
            const slotObjectIds = slotIds.map(id => {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new cutsomError_1.default(`Invalid slot ID: ${id}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                return new mongoose_1.default.Types.ObjectId(id);
            });
            if (paymentMethod === "wallet") {
                const walletBalance = yield this._walletService.getBalance(userId);
                if (walletBalance < totalPrice) {
                    throw new cutsomError_1.default("Insufficient wallet balance", HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const session = yield mongoose_1.default.startSession();
                session.startTransaction();
                try {
                    const transaction = yield this._walletService.debitWallet(userId, totalPrice, undefined, `Payment for booking at ${salon.salonName}`);
                    yield this._timeSlotService.updateSlotsStatus(slotIds, "booked");
                    const appointmentData = {
                        user: new mongoose_1.default.Types.ObjectId(userId),
                        salon: new mongoose_1.default.Types.ObjectId(salonId),
                        stylist: new mongoose_1.default.Types.ObjectId(stylistId),
                        services: serviceObjectIds,
                        slots: slotObjectIds,
                        status: IAppointment_1.AppointmentStatus.Confirmed,
                        totalPrice,
                        paymentStatus: IAppointment_1.PaymentStatus.Paid,
                        paymentMethod: IAppointment_1.PaymentMethod.Wallet,
                        serviceOption: serviceOption,
                        address: serviceOption === "home" ? address : undefined,
                        walletTransaction: transaction._id,
                        bookingId,
                    };
                    const appointment = yield this._appointmentService.createAppointment(appointmentData, session);
                    yield session.commitTransaction();
                    return { appointment };
                }
                catch (error) {
                    yield session.abortTransaction();
                    throw error;
                }
                finally {
                    session.endSession();
                }
            }
            else {
                const session = yield mongoose_1.default.startSession();
                session.startTransaction();
                try {
                    const reservedUntil = (0, moment_timezone_1.default)().add(15, "minutes").toDate();
                    yield this._timeSlotService.reserveSlotGroup(slotIds, reservedUntil, bookingId, userId, session);
                    yield session.commitTransaction();
                    return {
                        reservation: {
                            slotIds,
                            startTime,
                            endTime,
                            reservedUntil: reservedUntil.toISOString(),
                            totalPrice,
                            paymentMethod,
                            bookingId,
                            salonId,
                            stylistId,
                            serviceIds,
                            serviceOption,
                            address: serviceOption === "home" ? address : undefined,
                        },
                    };
                }
                catch (error) {
                    yield session.abortTransaction();
                    throw error;
                }
                finally {
                    session.endSession();
                }
            }
        });
    }
    createCheckoutSession(userId, checkoutData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, currency, metadata, reservedUntil: prevReservedUntil, bookingId } = checkoutData;
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!amount ||
                !currency ||
                !metadata ||
                !metadata.slotIds ||
                !metadata.serviceIds ||
                !metadata.userId ||
                !metadata.stylistId ||
                !metadata.salonId ||
                !prevReservedUntil ||
                !bookingId) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CHECKOUT_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (typeof metadata.services !== "string") {
                throw new cutsomError_1.default("Services metadata must be a string", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (metadata.userId !== userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!["online", "cash"].includes(metadata.paymentMethod)) {
                throw new cutsomError_1.default("Invalid payment method for checkout", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const slotIds = Array.isArray(metadata.slotIds)
                    ? metadata.slotIds
                    : JSON.parse(metadata.slotIds);
                const serviceIds = Array.isArray(metadata.serviceIds)
                    ? metadata.serviceIds
                    : JSON.parse(metadata.serviceIds);
                if (!slotIds.length || !serviceIds.length) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_CHECKOUT_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const slots = yield this._timeSlotService.getSlotsByIds(slotIds);
                const now = new Date();
                if (!slots.length || slots.length !== slotIds.length) {
                    throw new cutsomError_1.default("One or more slots not found", HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                if (slots.some((slot) => slot.status === "booked")) {
                    throw new cutsomError_1.default("One or more slots are already booked", HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const prevReservedUntilDate = new Date(prevReservedUntil);
                const invalidSlots = slots.filter((slot) => {
                    var _a;
                    const timeDiff = slot.reservedUntil ? Math.abs(slot.reservedUntil.getTime() - prevReservedUntilDate.getTime()) : Infinity;
                    return (!slot.reservedUntil ||
                        slot.reservedUntil < now ||
                        timeDiff > 5000 ||
                        slot.bookingId !== bookingId ||
                        ((_a = slot.userId) === null || _a === void 0 ? void 0 : _a.toString()) !== metadata.userId);
                });
                if (invalidSlots.length) {
                    throw new cutsomError_1.default("Slot reservation invalid or expired", HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const newReservedUntil = new Date(Date.now() + 10 * 60 * 1000);
                yield this._timeSlotService.reserveSlotGroup(slotIds, newReservedUntil, bookingId, metadata.userId, session);
                if (metadata.paymentMethod === "cash") {
                    const appointmentData = {
                        user: new mongoose_1.default.Types.ObjectId(metadata.userId),
                        salon: new mongoose_1.default.Types.ObjectId(metadata.salonId),
                        stylist: new mongoose_1.default.Types.ObjectId(metadata.stylistId),
                        services: serviceIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                        slots: slotIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                        status: IAppointment_1.AppointmentStatus.Confirmed,
                        totalPrice: amount,
                        paymentStatus: IAppointment_1.PaymentStatus.Pending,
                        paymentMethod: IAppointment_1.PaymentMethod.Cash,
                        serviceOption: metadata.serviceOption,
                        address: metadata.address ? JSON.parse(metadata.address) : undefined,
                        bookingId,
                    };
                    const appointment = yield this._appointmentService.createAppointment(appointmentData, session);
                    yield this._timeSlotService.updateSlotsStatus(slotIds, "booked");
                    yield session.commitTransaction();
                    return {
                        bookingId,
                        appointmentId: appointment._id.toString(),
                    };
                }
                const line_items = [
                    {
                        price_data: {
                            currency,
                            product_data: {
                                name: "Salon Booking",
                                description: `Payment for services: ${metadata.services}`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ];
                const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
                const stripeSession = yield stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items,
                    mode: "payment",
                    success_url: process.env.SUCCESS_URL || "http://localhost:5173/booking-success?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url: process.env.CANCEL_URL || "http://localhost:5173/booking-confirmation",
                    metadata: Object.assign(Object.assign({}, metadata), { slotIds: JSON.stringify(slotIds), bookingId, serviceIds: JSON.stringify(serviceIds) }),
                });
                yield session.commitTransaction();
                return {
                    id: stripeSession.id,
                };
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    handleWebhookEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Handling webhook event: ${event.type}`);
            const dbSession = yield mongoose_1.default.startSession();
            dbSession.startTransaction();
            try {
                switch (event.type) {
                    case "checkout.session.completed":
                        const session = event.data.object;
                        if (session.payment_status !== "paid") {
                            console.warn(`Unpaid session: ${session.id}`);
                            yield dbSession.commitTransaction();
                            return;
                        }
                        if (!session.metadata) {
                            throw new cutsomError_1.default("Missing metadata in session", HttpStatus_1.HttpStatus.BAD_REQUEST);
                        }
                        const requiredFields = [
                            "userId",
                            "salonId",
                            "stylistId",
                            "serviceIds",
                            "slotIds",
                            "bookingId",
                            "services",
                            "paymentMethod",
                            "serviceOption",
                        ];
                        for (const field of requiredFields) {
                            if (!session.metadata[field]) {
                                throw new cutsomError_1.default(`Missing required field in metadata: ${field}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
                            }
                        }
                        const existingAppointment = yield Appointment_1.default.findOne({
                            $or: [
                                { stripeSessionId: session.id },
                                { bookingId: session.metadata.bookingId },
                            ],
                        }).session(dbSession);
                        if (existingAppointment) {
                            yield dbSession.commitTransaction();
                            return;
                        }
                        let slotIds;
                        try {
                            slotIds = JSON.parse(session.metadata.slotIds);
                        }
                        catch (error) {
                            throw new cutsomError_1.default("Invalid slotIds format", HttpStatus_1.HttpStatus.BAD_REQUEST);
                        }
                        const slots = yield this._timeSlotService.getSlotsByIds(slotIds);
                        if (slots.length !== slotIds.length) {
                            throw new cutsomError_1.default("One or more slots not found", HttpStatus_1.HttpStatus.NOT_FOUND);
                        }
                        if (slots.some((slot) => slot.status === "booked")) {
                            throw new cutsomError_1.default("One or more slots are already booked", HttpStatus_1.HttpStatus.BAD_REQUEST);
                        }
                        if (slots.some((slot) => { var _a; return slot.bookingId !== ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId); })) {
                            throw new cutsomError_1.default("Slot booking ID mismatch", HttpStatus_1.HttpStatus.BAD_REQUEST);
                        }
                        const appointmentData = yield this.prepareAppointmentData(session.metadata, session);
                        yield Appointment_1.default.create([appointmentData], { session: dbSession });
                        yield this._timeSlotService.updateSlotsStatus(slotIds, "booked");
                        yield dbSession.commitTransaction();
                        break;
                    case "payment_intent.succeeded":
                    case "charge.succeeded":
                    case "charge.updated":
                    case "payment_intent.created":
                        break;
                    default:
                        console.log(`Unhandled event type: ${event.type}`);
                }
            }
            catch (error) {
                yield dbSession.abortTransaction();
                throw new cutsomError_1.default(error.message || "Webhook processing failed", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            finally {
                dbSession.endSession();
            }
        });
    }
    prepareAppointmentData(metadata, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const requiredFields = [
                "userId",
                "salonId",
                "stylistId",
                "serviceIds",
                "slotIds",
                "bookingId",
                "services",
                "paymentMethod",
                "serviceOption",
            ];
            for (const field of requiredFields) {
                if (!metadata[field]) {
                    throw new cutsomError_1.default(`Missing required field in metadata: ${field}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
            }
            let serviceIds;
            let slotIds;
            try {
                serviceIds = JSON.parse(metadata.serviceIds);
                slotIds = JSON.parse(metadata.slotIds);
            }
            catch (error) {
                throw new cutsomError_1.default("Invalid serviceIds or slotIds format", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            return {
                user: new mongoose_1.default.Types.ObjectId(metadata.userId),
                salon: new mongoose_1.default.Types.ObjectId(metadata.salonId),
                stylist: new mongoose_1.default.Types.ObjectId(metadata.stylistId),
                services: serviceIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                slots: slotIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                status: IAppointment_1.AppointmentStatus.Confirmed,
                totalPrice: session.amount_total ? session.amount_total / 100 : 0,
                paymentStatus: IAppointment_1.PaymentStatus.Paid,
                paymentMethod: metadata.paymentMethod === "online" ? IAppointment_1.PaymentMethod.Online : IAppointment_1.PaymentMethod.Cash,
                serviceOption: metadata.serviceOption === "home" ? "home" : "store",
                address: metadata.serviceOption === "home" && metadata.address ? JSON.parse(metadata.address) : undefined,
                stripeSessionId: session.id,
                bookingId: metadata.bookingId,
            };
        });
    }
    getCheckoutSessionStatus(userId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!sessionId) {
                throw new cutsomError_1.default("Missing checkout session ID", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
            const checkoutSession = yield stripe.checkout.sessions.retrieve(sessionId);
            if (checkoutSession.payment_status !== "paid") {
                throw new cutsomError_1.default("Payment is not completed yet", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (!checkoutSession.metadata) {
                throw new cutsomError_1.default("Missing metadata in checkout session", HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (checkoutSession.metadata.userId !== userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const appointment = yield Appointment_1.default.findOne({
                $or: [
                    { stripeSessionId: checkoutSession.id },
                    { bookingId: checkoutSession.metadata.bookingId },
                ],
                user: new mongoose_1.default.Types.ObjectId(userId),
            });
            if (appointment) {
                return {
                    bookingId: appointment.bookingId,
                    appointmentId: appointment._id.toString(),
                    status: "confirmed",
                };
            }
            return {
                bookingId: checkoutSession.metadata.bookingId,
                status: "pending",
            };
        });
    }
}
exports.default = BookingService;
