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
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const mongoose_1 = __importDefault(require("mongoose"));
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class AppointmentService {
    constructor(repository, slotRepository, walletService) {
        this._repository = repository;
        this._slotRepository = slotRepository;
        this._walletService = walletService;
    }
    createAppointment(appointment, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._repository.createAppointment(appointment, session !== null && session !== void 0 ? session : undefined);
        });
    }
    updateAppointmentByBookingId(bookingId, update, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this._repository.findByBookingId(bookingId, session);
            if (!appointment) {
                throw new cutsomError_1.default("Appointment not found", HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return this._repository.updateAppointment(appointment._id.toString(), update, { session });
        });
    }
    getAppointmentDetails(appointmentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_APPOINTMENT_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const appointment = yield this._repository.getAppointmentDetails(appointmentId, userId);
            if (!appointment) {
                throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return appointment;
        });
    }
    getUserAppointments(userId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (userId, status, page = 1, limit = 10) {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const validStatuses = ["pending", "confirmed", "cancelled", "completed", "upcoming", "past"];
            if (status && !validStatuses.includes(status)) {
                throw new cutsomError_1.default(`Invalid status. Allowed values: ${validStatuses.join(", ")}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (status === "cancelled" && page > 1) {
                return {
                    appointments: [],
                    total: 0,
                    page: 1,
                    pages: 1,
                    message: "Cancelled appointments typically don't require pagination",
                };
            }
            const result = yield this._repository.getUserAppointments(userId, status, page, limit);
            if (result.appointments.length === 0) {
                return Object.assign(Object.assign({}, result), { message: status
                        ? `No ${status} appointments found`
                        : Messages_1.Messages.USER_APPOINTMENTS_NOT_FOUND });
            }
            return result;
        });
    }
    getSalonAppointments(salonId_1, status_1) {
        return __awaiter(this, arguments, void 0, function* (salonId, status, page = 1, limit = 10) {
            if (!mongoose_1.default.Types.ObjectId.isValid(salonId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const validStatuses = ["pending", "confirmed", "cancelled", "completed", "upcoming", "past"];
            if (status && !validStatuses.includes(status)) {
                throw new cutsomError_1.default(`Invalid status. Allowed values: ${validStatuses.join(", ")}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const result = yield this._repository.getSalonAppointments(salonId, status, page, limit);
            if (result.appointments.length === 0) {
                return Object.assign(Object.assign({}, result), { message: status
                        ? `No ${status} appointments found for this salon`
                        : Messages_1.Messages.SALON_APPOINTMENTS_NOT_FOUND });
            }
            return result;
        });
    }
    cancelAppointment(appointmentId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbSession = yield mongoose_1.default.startSession();
            dbSession.startTransaction();
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_APPOINTMENT_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const ownershipValid = yield this._repository.validateAppointmentOwnershipBySalon(appointmentId, salonId);
                if (!ownershipValid) {
                    throw new cutsomError_1.default(Messages_1.Messages.UNAUTHORIZED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const appointment = yield this._repository.getSalonAppointmentDetails(appointmentId, salonId);
                if (!appointment) {
                    throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                if (appointment.status === IAppointment_1.AppointmentStatus.Cancelled) {
                    throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_ALREADY_CANCELLED, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                if (appointment.status === IAppointment_1.AppointmentStatus.Completed) {
                    throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_CANCEL_FAILED, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const earliestSlot = appointment.slots.reduce((earliest, slot) => {
                    const start = moment_timezone_1.default.utc(slot.startTime);
                    return !earliest || start.isBefore(moment_timezone_1.default.utc(earliest.startTime)) ? slot : earliest;
                }, null);
                const slotStartTime = moment_timezone_1.default.utc(earliestSlot.startTime);
                const now = moment_timezone_1.default.utc();
                const hoursUntilSlot = slotStartTime.diff(now, "hours");
                const isRefundable = hoursUntilSlot >= 48 && appointment.paymentStatus === IAppointment_1.PaymentStatus.Paid;
                for (const slot of appointment.slots) {
                    const slotDoc = yield this._slotRepository.findById(slot._id.toString());
                    if (!slotDoc) {
                        throw new cutsomError_1.default(Messages_1.Messages.SLOT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                    }
                    const updatedSlot = yield this._slotRepository.updateSlotStatus(slot._id.toString(), "available", slotDoc.version, { session: dbSession });
                    if (!updatedSlot) {
                        throw new cutsomError_1.default(Messages_1.Messages.SLOT_CONCURRENT_MODIFICATION, HttpStatus_1.HttpStatus.CONFLICT);
                    }
                }
                let updatedAppointment;
                if (isRefundable) {
                    const refundAmount = appointment.totalPrice;
                    const transaction = yield this._walletService.creditWallet(appointment.user._id.toString(), refundAmount, appointmentId, `Refund for cancelled appointment ${appointmentId}`);
                    updatedAppointment = yield this._repository.updateAppointment(appointmentId, {
                        status: IAppointment_1.AppointmentStatus.Cancelled,
                        refundToWallet: true,
                        walletTransaction: transaction._id,
                    }, { session: dbSession });
                }
                else {
                    updatedAppointment = yield this._repository.updateAppointment(appointmentId, { status: IAppointment_1.AppointmentStatus.Cancelled }, { session: dbSession });
                }
                yield dbSession.commitTransaction();
                const message = updatedAppointment.refundToWallet
                    ? `${Messages_1.Messages.APPOINTMENT_CANCELLED} ₹${updatedAppointment.totalPrice.toFixed(2)} refunded to wallet.`
                    : Messages_1.Messages.APPOINTMENT_CANCELLED;
                return { appointment: updatedAppointment, message };
            }
            catch (error) {
                yield dbSession.abortTransaction();
                throw new cutsomError_1.default(error.message || Messages_1.Messages.APPOINTMENT_CANCEL_FAILED, error.statusCode || HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            finally {
                dbSession.endSession();
            }
        });
    }
    completeAppointment(appointmentId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_APPOINTMENT_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const ownershipValid = yield this._repository.validateAppointmentOwnershipBySalon(appointmentId, salonId);
            if (!ownershipValid) {
                throw new cutsomError_1.default(Messages_1.Messages.UNAUTHORIZED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const appointment = yield this._repository.getSalonAppointmentDetails(appointmentId, salonId);
            if (!appointment) {
                throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            if (appointment.status === IAppointment_1.AppointmentStatus.Completed) {
                throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_ALREADY_COMPLETED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (appointment.status === IAppointment_1.AppointmentStatus.Cancelled) {
                throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_COMPLETE_FAILED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            return this._repository.updateAppointment(appointmentId, {
                status: IAppointment_1.AppointmentStatus.Completed,
            });
        });
    }
    cancelAppointmentByUser(appointmentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbSession = yield mongoose_1.default.startSession();
            dbSession.startTransaction();
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_APPOINTMENT_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const appointment = yield this._repository.getAppointmentDetails(appointmentId, userId);
                if (!appointment) {
                    throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                if (appointment.status === IAppointment_1.AppointmentStatus.Cancelled) {
                    throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_ALREADY_CANCELLED, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                if (appointment.status === IAppointment_1.AppointmentStatus.Completed) {
                    throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_CANCEL_FAILED, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const earliestSlot = appointment.slots.reduce((earliest, slot) => {
                    const start = moment_timezone_1.default.utc(slot.startTime);
                    return !earliest || start.isBefore(moment_timezone_1.default.utc(earliest.startTime)) ? slot : earliest;
                }, null);
                const slotStartTime = moment_timezone_1.default.utc(earliestSlot.startTime);
                const now = moment_timezone_1.default.utc();
                const hoursUntilSlot = slotStartTime.diff(now, "hours");
                const isRefundable = hoursUntilSlot >= 48 && appointment.paymentStatus === IAppointment_1.PaymentStatus.Paid;
                for (const slot of appointment.slots) {
                    const slotDoc = yield this._slotRepository.findById(slot._id.toString());
                    if (!slotDoc) {
                        throw new cutsomError_1.default(Messages_1.Messages.SLOT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                    }
                    const updatedSlot = yield this._slotRepository.updateSlotStatus(slot._id.toString(), "available", slotDoc.version, { session: dbSession });
                    if (!updatedSlot) {
                        throw new cutsomError_1.default(Messages_1.Messages.SLOT_CONCURRENT_MODIFICATION, HttpStatus_1.HttpStatus.CONFLICT);
                    }
                }
                let updatedAppointment;
                if (isRefundable) {
                    const refundAmount = appointment.totalPrice;
                    const transaction = yield this._walletService.creditWallet(userId, refundAmount, appointmentId, `Refund for cancelled appointment ${appointmentId}`);
                    updatedAppointment = yield this._repository.updateAppointment(appointmentId, {
                        status: IAppointment_1.AppointmentStatus.Cancelled,
                        refundToWallet: true,
                        walletTransaction: transaction._id,
                    }, { session: dbSession });
                }
                else {
                    updatedAppointment = yield this._repository.updateAppointment(appointmentId, { status: IAppointment_1.AppointmentStatus.Cancelled }, { session: dbSession });
                }
                yield dbSession.commitTransaction();
                const message = updatedAppointment.refundToWallet
                    ? `${Messages_1.Messages.APPOINTMENT_CANCELLED} ₹${updatedAppointment.totalPrice.toFixed(2)} refunded to your wallet.`
                    : Messages_1.Messages.APPOINTMENT_CANCELLED;
                return { appointment: updatedAppointment, message };
            }
            catch (error) {
                yield dbSession.abortTransaction();
                throw new cutsomError_1.default(error.message || Messages_1.Messages.APPOINTMENT_CANCEL_FAILED, error.statusCode || HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            finally {
                dbSession.endSession();
            }
        });
    }
    updatedAppointmentReview(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._repository.updateAppointment(appointmentId, { isReviewed: true });
        });
    }
}
exports.default = AppointmentService;
