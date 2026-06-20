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
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const BaseRepository_1 = require("./BaseRepository");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
const mongoose_1 = __importDefault(require("mongoose"));
class AppointmentRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Appointment_1.default);
    }
    createAppointment(data, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = new this.model(data);
            return yield appointment.save({ session });
        });
    }
    findBySessionId(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOne({ stripeSessionId: sessionId });
        });
    }
    findByBookingId(bookingId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOne({ bookingId }).session(session !== null && session !== void 0 ? session : null).exec();
        });
    }
    getAppointmentDetails(appointmentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Fetching appointment for:", { appointmentId, userId });
            const appointment = yield this.model
                .findOne({
                _id: appointmentId,
                user: userId,
            })
                .populate("user", "name email phone")
                .populate("salon", "salonName address phone timeZone")
                .populate("stylist", "name")
                .populate("services.service", "name")
                .populate({
                path: "slots",
                select: "startTime endTime",
                transform: (doc, id) => {
                    if (doc) {
                        return {
                            _id: id,
                            startTime: doc.startTime,
                            endTime: doc.endTime,
                        };
                    }
                    return null;
                },
            })
                .lean();
            console.log("Fetched appointment:", JSON.stringify(appointment, null, 2));
            if (!appointment)
                return null;
            const timeZone = "Asia/Kolkata";
            const totalDuration = appointment.services.reduce((sum, service) => sum + (service.duration || 0), 0);
            const formattedSlots = appointment.slots
                .filter((slot) => slot)
                .map((slot) => {
                const start = moment_timezone_1.default.utc(slot.startTime).tz(timeZone);
                const end = moment_timezone_1.default.utc(slot.endTime).tz(timeZone);
                return {
                    _id: slot._id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    formattedDate: start.format("MMMM Do YYYY"),
                    formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}`,
                };
            });
            return Object.assign(Object.assign({}, appointment), { slots: formattedSlots, totalDuration, formattedCreatedAt: (0, moment_timezone_1.default)(appointment.createdAt).tz(timeZone).format("MMMM Do YYYY, h:mm a") });
        });
    }
    getSalonAppointmentDetails(appointmentId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Fetching salon appointment for:", { appointmentId, salonId });
            const appointment = yield this.model
                .findOne({
                _id: appointmentId,
                salon: salonId,
            })
                .populate("user", "name email phone")
                .populate("salon", "salonName address phone timeZone")
                .populate("stylist", "name")
                .populate("services.service", "name")
                .populate({
                path: "slots",
                select: "startTime endTime",
                transform: (doc, id) => {
                    if (doc) {
                        return {
                            _id: id,
                            startTime: doc.startTime,
                            endTime: doc.endTime,
                        };
                    }
                    return null;
                },
            })
                .lean();
            console.log("Fetched salon appointment:", JSON.stringify(appointment, null, 2));
            if (!appointment)
                return null;
            const timeZone = "Asia/Kolkata";
            const totalDuration = appointment.services.reduce((sum, service) => sum + (service.duration || 0), 0);
            const formattedSlots = appointment.slots
                .filter((slot) => slot)
                .map((slot) => {
                const start = moment_timezone_1.default.utc(slot.startTime).tz(timeZone);
                const end = moment_timezone_1.default.utc(slot.endTime).tz(timeZone);
                return {
                    _id: slot._id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    formattedDate: start.format("MMMM Do YYYY"),
                    formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}`,
                };
            });
            return Object.assign(Object.assign({}, appointment), { slots: formattedSlots, totalDuration, formattedCreatedAt: (0, moment_timezone_1.default)(appointment.createdAt).tz(timeZone).format("MMMM Do YYYY, h:mm a") });
        });
    }
    validateAppointmentOwnershipBySalon(appointmentId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.model.exists({
                _id: appointmentId,
                salon: salonId,
            });
            return !!exists;
        });
    }
    getUserAppointments(userId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (userId, status, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const now = new Date();
            const match = { user: new mongoose_1.default.Types.ObjectId(userId) };
            if (status === "upcoming") {
                match.status = { $ne: "cancelled" };
            }
            else if (status === "past") {
                match.status = { $ne: "cancelled" };
            }
            else if (status) {
                match.status = status;
            }
            const pipeline = [
                { $match: match },
                {
                    $lookup: {
                        from: "timeslots",
                        localField: "slots",
                        foreignField: "_id",
                        as: "slotDetails",
                    },
                },
                {
                    $addFields: {
                        earliestSlot: {
                            $min: "$slotDetails.startTime",
                        },
                    },
                },
            ];
            if (status === "upcoming") {
                pipeline.push({
                    $match: {
                        earliestSlot: { $gt: now },
                    },
                });
            }
            else if (status === "past") {
                pipeline.push({
                    $match: {
                        earliestSlot: { $lte: now },
                    },
                });
            }
            pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }, {
                $lookup: {
                    from: "salons",
                    localField: "salon",
                    foreignField: "_id",
                    as: "salon",
                },
            }, { $unwind: "$salon" }, {
                $lookup: {
                    from: "stylists",
                    localField: "stylist",
                    foreignField: "_id",
                    as: "stylist",
                },
            }, { $unwind: "$stylist" }, {
                $lookup: {
                    from: "timeslots",
                    localField: "slots",
                    foreignField: "_id",
                    as: "slots",
                },
            }, {
                $project: {
                    "salon._id": 1, // Added
                    "salon.salonName": 1,
                    "salon.address": 1,
                    "salon.phone": 1,
                    "salon.timeZone": 1,
                    "salon.services": 1,
                    "stylist.name": 1,
                    "stylist._id": 1, // Added
                    "stylist.specialization": 1,
                    services: 1,
                    slots: {
                        $map: {
                            input: "$slots",
                            as: "slot",
                            in: {
                                _id: "$$slot._id",
                                startTime: "$$slot.startTime",
                                endTime: "$$slot.endTime",
                            },
                        },
                    },
                    status: 1,
                    totalPrice: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    serviceOption: 1,
                    address: 1,
                    isReviewed: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            });
            const [appointments, total] = yield Promise.all([
                this.model.aggregate(pipeline).exec(),
                this.model.countDocuments(match),
            ]);
            const formattedAppointments = appointments.map((appt) => {
                const timeZone = appt.salon.timeZone || "Asia/Kolkata";
                return Object.assign(Object.assign({}, appt), { slots: appt.slots.map((slot) => {
                        const start = moment_timezone_1.default.utc(slot.startTime).tz(timeZone);
                        const end = moment_timezone_1.default.utc(slot.endTime).tz(timeZone);
                        return Object.assign(Object.assign({}, slot), { formattedDate: start.format("MMMM Do YYYY"), formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}` });
                    }) });
            });
            return {
                appointments: formattedAppointments,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        });
    }
    getSalonAppointments(salonId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (salonId, status, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const now = new Date();
            const match = { salon: new mongoose_1.default.Types.ObjectId(salonId) };
            if (status === "upcoming") {
                match.status = { $ne: "cancelled" };
            }
            else if (status === "past") {
                match.status = { $ne: "cancelled" };
            }
            else if (status) {
                match.status = status;
            }
            const pipeline = [
                { $match: match },
                {
                    $lookup: {
                        from: "timeslots",
                        localField: "slots",
                        foreignField: "_id",
                        as: "slotDetails",
                    },
                },
                {
                    $addFields: {
                        earliestSlot: {
                            $min: "$slotDetails.startTime",
                        },
                    },
                },
            ];
            if (status === "upcoming") {
                pipeline.push({
                    $match: {
                        earliestSlot: { $gt: now },
                    },
                });
            }
            else if (status === "past") {
                pipeline.push({
                    $match: {
                        earliestSlot: { $lte: now },
                    },
                });
            }
            pipeline.push({
                $sort: {
                    "slotDetails.startTime": -1,
                },
            }, { $skip: skip }, { $limit: limit }, {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            }, { $unwind: "$user" }, {
                $lookup: {
                    from: "stylists",
                    localField: "stylist",
                    foreignField: "_id",
                    as: "stylist",
                },
            }, { $unwind: "$stylist" }, {
                $lookup: {
                    from: "salons",
                    localField: "salon",
                    foreignField: "_id",
                    as: "salon",
                },
            }, { $unwind: "$salon" }, {
                $lookup: {
                    from: "timeslots",
                    localField: "slots",
                    foreignField: "_id",
                    as: "slots",
                },
            }, {
                $project: {
                    "user.firstname": 1,
                    "user.lastname": 1,
                    "user.email": 1,
                    "user.phone": 1,
                    "user.address": 1,
                    "stylist.name": 1,
                    "stylist.specialization": 1,
                    "salon.services": 1,
                    services: 1,
                    slots: {
                        $map: {
                            input: "$slots",
                            as: "slot",
                            in: {
                                _id: "$$slot._id",
                                startTime: "$$slot.startTime",
                                endTime: "$$slot.endTime",
                            },
                        },
                    },
                    status: 1,
                    totalPrice: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    serviceOption: 1,
                    address: 1,
                    isReviewed: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            });
            const [appointments, total] = yield Promise.all([
                this.model.aggregate(pipeline).exec(),
                this.model.countDocuments(match),
            ]);
            const formattedAppointments = appointments.map((appt) => {
                const timeZone = appt.salon.timeZone || "Asia/Kolkata";
                return Object.assign(Object.assign({}, appt), { slots: appt.slots.map((slot) => {
                        const start = moment_timezone_1.default.utc(slot.startTime).tz(timeZone);
                        const end = moment_timezone_1.default.utc(slot.endTime).tz(timeZone);
                        return Object.assign(Object.assign({}, slot), { formattedDate: start.format("MMMM Do YYYY"), formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}` });
                    }) });
            });
            return {
                appointments: formattedAppointments,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        });
    }
    updateAppointment(appointmentId, updates, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.model
                .findByIdAndUpdate(appointmentId, updates, Object.assign({ new: true }, options))
                .populate("user", "name email phone")
                .populate("salon", "salonName address phone timeZone")
                .populate("stylist", "name")
                .populate("services.service", "name")
                .populate({
                path: "slots",
                select: "startTime endTime",
                transform: (doc, id) => {
                    if (doc) {
                        return {
                            _id: id,
                            startTime: doc.startTime,
                            endTime: doc.endTime,
                        };
                    }
                    return null;
                },
            });
            if (!appointment) {
                throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return appointment;
        });
    }
    countAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments();
        });
    }
    countBySalon(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments({ salon: salonId });
        });
    }
    countPendingBySalon(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments({ salon: salonId, status: { $in: ["confirmed", "pending"] } });
        });
    }
    sumRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.model.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        });
    }
    sumRevenueBySalon(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.model.aggregate([
                { $match: { salon: new mongoose_1.default.Types.ObjectId(salonId), paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        });
    }
    getRevenueTrend(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.aggregate([
                { $match: { paymentStatus: "paid", createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" } } },
                { $sort: { _id: 1 } },
                { $project: { date: "$_id", revenue: 1, _id: 0 } }
            ]);
        });
    }
    getRevenueTrendBySalon(salonId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.aggregate([
                {
                    $match: {
                        salon: new mongoose_1.default.Types.ObjectId(salonId),
                        paymentStatus: "paid",
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$totalPrice" },
                    },
                },
                { $sort: { _id: 1 } },
                { $project: { date: "$_id", revenue: 1, _id: 0 } },
            ]);
        });
    }
    getStatusCounts() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.aggregate([
                { $group: { _id: "$status", value: { $sum: 1 } } },
                { $project: { name: "$_id", value: 1, _id: 0 } },
            ]);
        });
    }
    getStatusCountsBySalon(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.aggregate([
                { $match: { salon: new mongoose_1.default.Types.ObjectId(salonId) } },
                { $group: { _id: "$status", value: { $sum: 1 } } },
                { $project: { name: "$_id", value: 1, _id: 0 } },
            ]);
        });
    }
    getRecentAppointments(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("salon", "salonName");
        });
    }
    getRecentAppointmentsBySalon(salonId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.find({ salon: salonId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("user", "firstname lastname")
                .lean();
        });
    }
}
exports.default = AppointmentRepository;
