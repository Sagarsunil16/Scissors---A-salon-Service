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
const mongoose_1 = __importDefault(require("mongoose"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const HttpStatus_1 = require("../constants/HttpStatus");
class SlotService {
    constructor(salonRepository, timeslotRepository, stylistRepository) {
        this._salonRepository = salonRepository;
        this._timeSlotRepository = timeslotRepository;
        this._stylistRepository = stylistRepository;
    }
    findAllAvailableSlots(salonId, date, stylistId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salon = yield this._salonRepository.getSalonById(salonId);
                if (!salon)
                    throw new cutsomError_1.default("Salon not found", 404);
                const stylist = yield this._stylistRepository.findStylistById(stylistId);
                if (!stylist)
                    throw new cutsomError_1.default("Stylist not found", 404);
                const timeZone = salon.timeZone || "Asia/Kolkata";
                const localDate = moment_timezone_1.default.tz(date, timeZone).startOf("day");
                const startOfDay = localDate.clone().utc().toDate();
                const endOfDay = localDate.clone().endOf("day").utc().toDate();
                console.log(`Querying slots for ${stylistId} on ${localDate.format('YYYY-MM-DD')} from ${(0, moment_timezone_1.default)(startOfDay).format('HH:mm')} to ${(0, moment_timezone_1.default)(endOfDay).format('HH:mm')} UTC`);
                const allSlots = yield this._timeSlotRepository.findAllSlots(salonId, localDate.toDate(), stylistId, timeZone);
                console.log(`Found ${allSlots.length} total slots`, allSlots.map(s => ({
                    _id: s._id.toString(),
                    startTime: (0, moment_timezone_1.default)(s.startTime).tz(timeZone).format('HH:mm'),
                    endTime: (0, moment_timezone_1.default)(s.endTime).tz(timeZone).format('HH:mm'),
                    utcStartTime: (0, moment_timezone_1.default)(s.startTime).utc().format('HH:mm'),
                    status: s.status,
                    salonId: s.salon.toString(),
                    stylistId: s.stylist.toString()
                })));
                const availableSlots = yield this._timeSlotRepository.findAvailableSlots(salonId, localDate.toDate(), stylistId, timeZone);
                console.log(`Found ${availableSlots.length} available slots`, availableSlots.map(s => ({
                    _id: s._id.toString(),
                    startTime: (0, moment_timezone_1.default)(s.startTime).tz(timeZone).format('HH:mm'),
                    endTime: (0, moment_timezone_1.default)(s.endTime).tz(timeZone).format('HH:mm'),
                    utcStartTime: (0, moment_timezone_1.default)(s.startTime).utc().format('HH:mm'),
                    status: s.status,
                    salonId: s.salon.toString(),
                    stylistId: s.stylist.toString()
                })));
                return availableSlots;
            }
            catch (error) {
                console.error("Error in findAllAvailableSlots:", { salonId, stylistId, error });
                if (error.statusCode === 400 || error.statusCode === 404) {
                    throw error;
                }
                throw new cutsomError_1.default(error.message || "Failed to find available slots", 500);
            }
        });
    }
    generateSlots(salonId, date, stylistId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Generating slots for:", {
                    salonId,
                    date: (0, moment_timezone_1.default)(date).format('YYYY-MM-DD HH:mm:ss Z'),
                    stylistId
                });
                const [salon, stylist] = yield Promise.all([
                    this._salonRepository.getSalonById(salonId),
                    this._stylistRepository.findStylistById(stylistId)
                ]);
                if (!salon)
                    throw new cutsomError_1.default("Salon not found", 404);
                if (!stylist)
                    throw new cutsomError_1.default("Stylist not found", 404);
                const timeZone = salon.timeZone || 'Asia/Kolkata';
                const localDate = moment_timezone_1.default.tz(date, timeZone).startOf('day');
                const dayOfWeek = localDate.format('dddd');
                console.log(`Checking working hours for ${stylistId} on ${dayOfWeek}`);
                console.log(`Stylist working hours:`, stylist.workingHours);
                console.log(`Salon hours: openingTime=${salon.openingTime}, closingTime=${salon.closingTime}`);
                const workingHours = stylist.workingHours.find(wh => wh.day === dayOfWeek);
                if (!workingHours) {
                    throw new cutsomError_1.default(`Stylist ${stylist.name} is not available on ${dayOfWeek}`, 400);
                }
                const parseTime = (timeStr, defaultTime) => {
                    if (!timeStr || !timeStr.includes(':')) {
                        console.warn(`Invalid time format: ${timeStr}, using default: ${defaultTime}`);
                        timeStr = defaultTime;
                    }
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    if (isNaN(hours) || isNaN(minutes)) {
                        console.warn(`Invalid time values: ${timeStr}, using default: ${defaultTime}`);
                        const [defHours, defMinutes] = defaultTime.split(':').map(Number);
                        return moment_timezone_1.default.tz(`${localDate.format('YYYY-MM-DD')} ${defaultTime}`, 'YYYY-MM-DD HH:mm', timeZone);
                    }
                    const time = moment_timezone_1.default.tz(`${localDate.format('YYYY-MM-DD')} ${timeStr}`, 'YYYY-MM-DD HH:mm', timeZone);
                    console.log(`Parsed ${timeStr} to ${time.format('YYYY-MM-DD HH:mm:ss Z')}`);
                    return time;
                };
                const stylistStart = parseTime(workingHours.startTime, '09:00');
                const stylistEnd = parseTime(workingHours.endTime, '17:00');
                const salonStart = parseTime(salon.openingTime, '09:00');
                const salonEnd = parseTime(salon.closingTime, '22:00');
                const startTime = moment_timezone_1.default.max(stylistStart, salonStart);
                const endTime = moment_timezone_1.default.min(stylistEnd, salonEnd);
                if (startTime.isSameOrAfter(endTime)) {
                    throw new cutsomError_1.default(`No valid working hours for ${stylist.name} on ${localDate.format('YYYY-MM-DD')}. Start: ${startTime.format('HH:mm')}, End: ${endTime.format('HH:mm')}`, 400);
                }
                console.log(`Generating slots from ${startTime.format('HH:mm')} to ${endTime.format('HH:mm')} in ${timeZone}`);
                const slots = [];
                let currentTime = startTime.clone();
                const slotDuration = 30;
                const coolOffPeriod = 10;
                while (currentTime.isBefore(endTime)) {
                    const slotEnd = currentTime.clone().add(slotDuration, 'minutes');
                    if (slotEnd.isAfter(endTime))
                        break;
                    const slotStartUTC = currentTime.clone().utc().toDate();
                    const slotEndUTC = slotEnd.clone().utc().toDate();
                    console.log(`Creating slot: ${currentTime.format('HH:mm')}–${slotEnd.format('HH:mm')} IST, ${(0, moment_timezone_1.default)(slotStartUTC).utc().format('HH:mm')}–${(0, moment_timezone_1.default)(slotEndUTC).utc().format('HH:mm')} UTC`);
                    slots.push({
                        salon: new mongoose_1.default.Types.ObjectId(salonId),
                        stylist: new mongoose_1.default.Types.ObjectId(stylistId),
                        startTime: slotStartUTC,
                        endTime: slotEndUTC,
                        status: "available",
                        version: 0,
                        reservedUntil: null,
                        userId: null,
                        bookingId: null
                    });
                    currentTime = slotEnd.clone().add(coolOffPeriod, 'minutes');
                }
                const existingSlots = yield this._timeSlotRepository.findAllSlots(salonId, localDate.toDate(), stylistId, timeZone);
                console.log(`Found ${existingSlots.length} existing slots`, existingSlots.map(s => ({
                    startTime: (0, moment_timezone_1.default)(s.startTime).tz(timeZone).format('HH:mm'),
                    utcStartTime: (0, moment_timezone_1.default)(s.startTime).utc().format('HH:mm'),
                    status: s.status
                })));
                const newSlots = slots.filter(newSlot => {
                    return !existingSlots.some(existingSlot => (0, moment_timezone_1.default)(existingSlot.startTime).isSame((0, moment_timezone_1.default)(newSlot.startTime), 'minute') &&
                        (0, moment_timezone_1.default)(existingSlot.endTime).isSame((0, moment_timezone_1.default)(newSlot.endTime), 'minute'));
                });
                if (newSlots.length > 0) {
                    const createdSlots = yield this._timeSlotRepository.bulkCreate(newSlots);
                    console.log(`Generated ${createdSlots.length} new slots`, createdSlots.map(s => ({
                        _id: s._id.toString(),
                        startTime: (0, moment_timezone_1.default)(s.startTime).tz(timeZone).format('HH:mm'),
                        endTime: (0, moment_timezone_1.default)(s.endTime).tz(timeZone).format('HH:mm'),
                        utcStartTime: (0, moment_timezone_1.default)(s.startTime).utc().format('HH:mm'),
                        utcEndTime: (0, moment_timezone_1.default)(s.endTime).utc().format('HH:mm')
                    })));
                    return createdSlots;
                }
                else {
                    console.log("No new slots created, existing slots found");
                }
                return [];
            }
            catch (error) {
                console.error("Slot generation failed:", error);
                throw error;
            }
        });
    }
    findConsecutiveSlots(salonId, serviceIds, date, stylistId, requiredDuration) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salon = yield this._salonRepository.getSalonById(salonId);
                if (!salon)
                    throw new cutsomError_1.default("Salon not found", 404);
                const stylist = yield this._stylistRepository.findStylistById(stylistId);
                if (!stylist)
                    throw new cutsomError_1.default("Stylist not found", 404);
                const stylistServiceIds = salon.services
                    .filter((service) => service.stylists.some((stylist) => stylist._id.toString() === stylistId))
                    .map((service) => service._id.toString());
                if (!serviceIds.every(id => stylistServiceIds.includes(id))) {
                    const serviceNames = salon.services
                        .filter((s) => serviceIds.includes(s._id.toString()))
                        .map((s) => s.service);
                    throw new cutsomError_1.default(`Stylist ${stylist.name} does not offer all selected services: ${serviceNames.join(', ')}`, 400);
                }
                const timeZone = salon.timeZone || "Asia/Kolkata";
                const localDate = moment_timezone_1.default.tz(date, timeZone).startOf("day");
                const availableSlots = yield this._timeSlotRepository.findAvailableSlots(salonId, localDate.toDate(), stylistId, timeZone);
                if (availableSlots.length === 0) {
                    console.log(`No available slots for ${stylistId} on ${localDate.format('YYYY-MM-DD')}`);
                    return [];
                }
                availableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
                const totalDuration = requiredDuration !== null && requiredDuration !== void 0 ? requiredDuration : salon.services
                    .filter((s) => serviceIds.includes(s._id.toString()))
                    .reduce((sum, s) => sum + (s.duration || 30), 0);
                const slotDuration = 30;
                const coolOffPeriod = 10;
                const slotsNeeded = Math.ceil(totalDuration / slotDuration);
                console.log(`Service requires ${slotsNeeded} slot(s) for ${totalDuration} minutes`);
                const slotGroups = [];
                for (let i = 0; i <= availableSlots.length - slotsNeeded; i++) {
                    const group = availableSlots.slice(i, i + slotsNeeded);
                    if (group.length === slotsNeeded) {
                        let isConsecutive = true;
                        for (let j = 1; j < group.length; j++) {
                            const prevEnd = (0, moment_timezone_1.default)(group[j - 1].endTime);
                            const currStart = (0, moment_timezone_1.default)(group[j].startTime);
                            if (currStart.diff(prevEnd, 'minutes') !== coolOffPeriod) {
                                isConsecutive = false;
                                break;
                            }
                        }
                        if (isConsecutive) {
                            const groupDuration = (0, moment_timezone_1.default)(group[group.length - 1].endTime)
                                .diff((0, moment_timezone_1.default)(group[0].startTime), 'minutes');
                            slotGroups.push({
                                _id: group.map(s => s._id.toString()).join(','),
                                startTime: group[0].startTime,
                                endTime: group[group.length - 1].endTime,
                                stylist: new mongoose_1.default.Types.ObjectId(stylistId),
                                salon: new mongoose_1.default.Types.ObjectId(salonId),
                                status: "available",
                                slotIds: group.map(s => s._id.toString()),
                                duration: groupDuration
                            });
                        }
                    }
                }
                console.log(`Found ${slotGroups.length} slot groups for ${totalDuration} minutes`);
                return slotGroups;
            }
            catch (error) {
                console.error("Detailed findConsecutiveSlots error:", { stylistId, serviceIds, error });
                throw error;
            }
        });
    }
    findAvailableSlots(salonId, serviceIds, date, stylistId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salon = yield this._salonRepository.getSalonById(salonId);
                if (!salon)
                    throw new cutsomError_1.default("Salon not found", 404);
                const services = salon.services.filter(s => serviceIds.includes(s._id.toString()));
                if (services.length !== serviceIds.length) {
                    const serviceNames = salon.services
                        .filter((s) => serviceIds.includes(s._id.toString()))
                        .map((s) => s.service);
                    throw new cutsomError_1.default(`One or more services not found: ${serviceNames.join(', ')}`, 400);
                }
                const timeZone = salon.timeZone || "Asia/Kolkata";
                const localDate = moment_timezone_1.default.tz(date, timeZone).startOf("day");
                const existingSlots = yield this._timeSlotRepository.findAllSlots(salonId, localDate.toDate(), stylistId, timeZone);
                if (existingSlots.length === 0) {
                    console.log(`No slots found, generating for ${stylistId} on ${localDate.format('YYYY-MM-DD')}`);
                    yield this.generateSlots(salonId, localDate.toDate(), stylistId);
                }
                return yield this.findConsecutiveSlots(salonId, serviceIds, date, stylistId);
            }
            catch (error) {
                console.error("Detailed findAvailableSlots error:", { salonId, serviceIds, stylistId, error });
                if (error.statusCode === 400 || error.statusCode === 404) {
                    throw error;
                }
                throw new cutsomError_1.default(error.message || "Failed to find available slots", 500);
            }
        });
    }
    updateSlotStatus(slotId, slotStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slot = yield this._timeSlotRepository.findById(slotId);
                if (!slot || slot.status !== "available") {
                    throw new cutsomError_1.default("Slot not found or not available", 409);
                }
                return yield this._timeSlotRepository.updateSlotStatus(slotId, slotStatus, slot.version);
            }
            catch (error) {
                console.error("Error in updateSlotStatus:", error);
                throw new cutsomError_1.default(error.message || "Failed to update slot status", 500);
            }
        });
    }
    findAvailableSlotsById(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this._timeSlotRepository.findById(slotId);
            if (slot &&
                slot.status === "available" &&
                (!slot.reservedUntil || slot.reservedUntil <= new Date()))
                return slot;
            return null;
        });
    }
    findAvailableSlotsByIds(slotIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield this._timeSlotRepository.findByIds(slotIds);
            const now = new Date();
            return slots.filter((slot) => slot.status === "available" &&
                (!slot.reservedUntil || slot.reservedUntil <= now));
        });
    }
    reserveSlotGroup(slotIds, reservedUntil, bookingId, userId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const dbSession = session || (yield mongoose_1.default.startSession());
            if (!session)
                dbSession.startTransaction();
            try {
                const slots = yield this._timeSlotRepository.findByIds(slotIds, session);
                if (slots.length !== slotIds.length) {
                    throw new cutsomError_1.default("One or more slots not found", HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                console.log("Slots before reservation:", slots.map(s => {
                    var _a, _b;
                    return ({
                        _id: s._id.toString(),
                        status: s.status,
                        reservedUntil: (_a = s.reservedUntil) === null || _a === void 0 ? void 0 : _a.toISOString(),
                        bookingId: s.bookingId,
                        userId: (_b = s.userId) === null || _b === void 0 ? void 0 : _b.toString(),
                        version: s.version
                    });
                }));
                const now = new Date();
                for (const slot of slots) {
                    if (slot.status === "booked") {
                        throw new cutsomError_1.default("One or more slots are booked", HttpStatus_1.HttpStatus.CONFLICT);
                    }
                    if (slot.status === "reserved" &&
                        slot.reservedUntil &&
                        slot.reservedUntil > now &&
                        (slot.bookingId !== bookingId || ((_a = slot.userId) === null || _a === void 0 ? void 0 : _a.toString()) !== userId)) {
                        console.log(`Slot ${slot._id} already reserved by another user until ${slot.reservedUntil}`);
                        throw new cutsomError_1.default("One or more slots are already reserved", HttpStatus_1.HttpStatus.CONFLICT);
                    }
                }
                const result = yield this._timeSlotRepository.updateMany({
                    _id: { $in: slotIds },
                    $or: [
                        { status: "available", reservedUntil: null },
                        { status: "reserved", reservedUntil: { $lte: now } },
                        { status: "reserved", bookingId, userId }
                    ]
                }, { $set: { reservedUntil, status: "reserved", bookingId, userId }, $inc: { version: 1 } }, { session: dbSession });
                console.log(`Reserve slot result: matched=${result.matchedCount}, modified=${result.modifiedCount}, slotIds=${slotIds.length}`);
                if (result.matchedCount !== slotIds.length) {
                    throw new cutsomError_1.default("Failed to reserve one or more slots", HttpStatus_1.HttpStatus.CONFLICT);
                }
                if (!session)
                    yield dbSession.commitTransaction();
                console.log(`Reserved slots ${slotIds} until ${reservedUntil.toISOString()} for booking ${bookingId}`);
            }
            catch (error) {
                if (!session)
                    yield dbSession.abortTransaction();
                console.error("Error in reserveSlotGroup:", { slotIds, reservedUntil: reservedUntil.toISOString(), bookingId, userId, error });
                throw error;
            }
            finally {
                if (!session)
                    dbSession.endSession();
            }
        });
    }
    releaseSlots(slotIds, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbSession = session || (yield mongoose_1.default.startSession());
            if (!session)
                dbSession.startTransaction();
            try {
                const result = yield this._timeSlotRepository.updateMany({ _id: { $in: slotIds }, status: "reserved" }, { $set: { status: "available", reservedUntil: null, bookingId: null, userId: null }, $inc: { version: 1 } }, { session: dbSession });
                console.log(`Release slot result: matched=${result.matchedCount}, modified=${result.modifiedCount}, slotIds=${slotIds.length}`);
                if (result.matchedCount !== slotIds.length) {
                    console.warn("Some slots were not released, possibly not reserved");
                }
                if (!session)
                    yield dbSession.commitTransaction();
            }
            catch (error) {
                if (!session)
                    yield dbSession.abortTransaction();
                console.error("Error in releaseSlots:", { slotIds, error });
                throw error;
            }
            finally {
                if (!session)
                    dbSession.endSession();
            }
        });
    }
    getSlotsByIds(slotIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._timeSlotRepository.findByIds(slotIds);
        });
    }
    updateSlotsStatus(slotIds, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const slots = yield this._timeSlotRepository.findByIds(slotIds);
                if (slots.length !== slotIds.length) {
                    throw new cutsomError_1.default("One or more slots not found", HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                const now = new Date();
                for (const slot of slots) {
                    if (slot.status === "booked" && status !== "available") {
                        throw new cutsomError_1.default("Cannot modify booked slot", HttpStatus_1.HttpStatus.CONFLICT);
                    }
                    if (slot.status === "reserved" && slot.reservedUntil && slot.reservedUntil > now && status !== "booked") {
                        throw new cutsomError_1.default("Cannot modify reserved slot", HttpStatus_1.HttpStatus.CONFLICT);
                    }
                }
                const result = yield this._timeSlotRepository.updateMany({ _id: { $in: slotIds } }, { $set: { status, reservedUntil: null }, $inc: { version: 1 } }, { session });
                if (result.matchedCount !== slotIds.length) {
                    throw new cutsomError_1.default("One or more slots could not be updated", HttpStatus_1.HttpStatus.CONFLICT);
                }
                yield session.commitTransaction();
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
}
exports.default = SlotService;
