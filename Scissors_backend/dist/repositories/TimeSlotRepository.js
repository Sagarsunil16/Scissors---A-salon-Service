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
const mongoose_1 = __importDefault(require("mongoose"));
const TimeSlot_1 = __importDefault(require("../models/TimeSlot"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class TimeSlotRepository {
    findAllSlots(salonId_1, date_1, stylistId_1) {
        return __awaiter(this, arguments, void 0, function* (salonId, date, stylistId, timeZone = "Asia/Kolkata") {
            const localDate = moment_timezone_1.default.tz(date, timeZone).startOf('day');
            const startOfDay = localDate.clone().utc().toDate();
            const endOfDay = localDate.clone().endOf('day').utc().toDate();
            const query = {
                salon: new mongoose_1.default.Types.ObjectId(salonId),
                startTime: { $gte: startOfDay, $lte: endOfDay },
            };
            if (stylistId) {
                query.stylist = new mongoose_1.default.Types.ObjectId(stylistId);
            }
            return TimeSlot_1.default.find(query).exec();
        });
    }
    findAvailableSlots(salonId_1, date_1, stylistId_1) {
        return __awaiter(this, arguments, void 0, function* (salonId, date, stylistId, timeZone = "Asia/Kolkata") {
            const localDate = moment_timezone_1.default.tz(date, timeZone).startOf('day');
            const startOfDay = localDate.clone().utc().toDate();
            const endOfDay = localDate.clone().endOf('day').utc().toDate();
            const query = {
                salon: new mongoose_1.default.Types.ObjectId(salonId),
                startTime: { $gte: startOfDay, $lte: endOfDay },
                $or: [
                    { status: "available", reservedUntil: null },
                    { status: "available", reservedUntil: { $lte: new Date() } },
                    { status: "reserved", reservedUntil: { $lte: new Date() } },
                ],
            };
            if (stylistId) {
                query.stylist = new mongoose_1.default.Types.ObjectId(stylistId);
            }
            return yield TimeSlot_1.default.find(query)
                .sort({ startTime: 1 })
                .exec();
        });
    }
    bulkCreate(slots) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield TimeSlot_1.default.insertMany(slots, { ordered: false });
            }
            catch (error) {
                if (error.code === 11000) {
                    console.log('Some slots already exist, continuing with created ones');
                    return error.ops || [];
                }
                throw new cutsomError_1.default("Failed to create slots", 500);
            }
        });
    }
    updateSlotStatus(slotId_1, status_1, version_1) {
        return __awaiter(this, arguments, void 0, function* (slotId, status, version, options = {}) {
            return TimeSlot_1.default.findOneAndUpdate({ _id: slotId, version }, { status, $inc: { version: 1 } }, Object.assign({ new: true }, options)).exec();
        });
    }
    findById(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return TimeSlot_1.default.findById(slotId).exec();
        });
    }
    findByIds(slotIds, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = TimeSlot_1.default.find({ _id: { $in: slotIds } });
            if (session) {
                query.session(session);
            }
            return query.exec();
        });
    }
    updateMany(filter_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (filter, update, options = {}) {
            return yield TimeSlot_1.default.updateMany(filter, update).exec();
        });
    }
    clearExpiredReservations() {
        return __awaiter(this, void 0, void 0, function* () {
            yield TimeSlot_1.default.updateMany({ reservedUntil: { $lte: new Date() } }, { status: "available", reservedUntil: null, bookingId: null, userId: null }).exec();
        });
    }
    find(query) {
        return TimeSlot_1.default.find(query);
    }
}
exports.default = TimeSlotRepository;
