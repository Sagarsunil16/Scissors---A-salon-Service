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
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
class AppointmentController {
    constructor(appointmentService) {
        this._appointmentService = appointmentService;
    }
    getAppointmentDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const appointmentId = req.params.id;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const appointment = yield this._appointmentService.getAppointmentDetails(appointmentId, userId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.APPOINTMENT_DETAILS_FETCHED,
                    data: appointment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserAppointments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { status, page = "1", limit = "10" } = req.query;
                if (!userId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const result = yield this._appointmentService.getUserAppointments(userId, status === null || status === void 0 ? void 0 : status.toString(), Number(page), Number(limit));
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.USER_APPOINTMENTS_SUCCESS,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalonAppointments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const salonId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { status, page = "1", limit = "10" } = req.query;
                if (!salonId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const result = yield this._appointmentService.getSalonAppointments(salonId, status === null || status === void 0 ? void 0 : status.toString(), Number(page), Number(limit));
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SALON_APPOINTMENTS_SUCCESS,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    cancelAppointment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const salonId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!salonId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const { appointment, message } = yield this._appointmentService.cancelAppointment(id, salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message,
                    data: appointment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    completeAppointment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const salonId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!salonId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const updatedAppointment = yield this._appointmentService.completeAppointment(id, salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.APPOINTMENT_COMPLETED,
                    data: updatedAppointment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    cancelAppointmentByUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const appointmentId = req.params.id;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const { appointment, message } = yield this._appointmentService.cancelAppointmentByUser(appointmentId, userId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message,
                    data: appointment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AppointmentController;
