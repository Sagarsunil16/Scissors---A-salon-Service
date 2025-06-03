import moment from "moment-timezone";
import mongoose from "mongoose";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import { ITimeSlot, ITimeSlotDocument, ISlotGroup } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";
import { HttpStatus } from "../constants/HttpStatus";

class SlotService implements ITimeSlotService {
  private _salonRepository: ISalonRepository;
  private _timeSlotRepository: ITimeSlotRepository;
  private _stylistRepository: IStylistRepository;

  constructor(
    salonRepository: ISalonRepository,
    timeslotRepository: ITimeSlotRepository,
    stylistRepository: IStylistRepository
  ) {
    this._salonRepository = salonRepository;
    this._timeSlotRepository = timeslotRepository;
    this._stylistRepository = stylistRepository;
  }

  async findAllAvailableSlots(salonId: string, date: Date, stylistId: string): Promise<ITimeSlotDocument[]> {
    try {
      const salon = await this._salonRepository.getSalonById(salonId);
      if (!salon) throw new CustomError("Salon not found", 404);

      const stylist = await this._stylistRepository.findStylistById(stylistId);
      if (!stylist) throw new CustomError("Stylist not found", 404);

      const timeZone = salon.timeZone || "Asia/Kolkata";
      const localDate = moment.tz(date, timeZone).startOf("day");
      const startOfDay = localDate.clone().utc().toDate();
      const endOfDay = localDate.clone().endOf("day").utc().toDate();

      console.log(`Querying slots for ${stylistId} on ${localDate.format('YYYY-MM-DD')} from ${moment(startOfDay).format('HH:mm')} to ${moment(endOfDay).format('HH:mm')} UTC`);

      const allSlots = await this._timeSlotRepository.findAllSlots(salonId, localDate.toDate(), stylistId);
      console.log(`Found ${allSlots.length} total slots`, allSlots.map(s => ({
        _id: s._id.toString(),
        startTime: moment(s.startTime).tz(timeZone).format('HH:mm'),
        endTime: moment(s.endTime).tz(timeZone).format('HH:mm'),
        utcStartTime: moment(s.startTime).utc().format('HH:mm'),
        status: s.status,
        salonId: s.salon.toString(),
        stylistId: s.stylist.toString()
      })));

      const availableSlots = await this._timeSlotRepository.findAvailableSlots(
        salonId,
        localDate.toDate(),
        stylistId
      );

      console.log(`Found ${availableSlots.length} available slots`, availableSlots.map(s => ({
        _id: s._id.toString(),
        startTime: moment(s.startTime).tz(timeZone).format('HH:mm'),
        endTime: moment(s.endTime).tz(timeZone).format('HH:mm'),
        utcStartTime: moment(s.startTime).utc().format('HH:mm'),
        status: s.status,
        salonId: s.salon.toString(),
        stylistId: s.stylist.toString()
      })));
      return availableSlots;
    } catch (error: any) {
      console.error("Error in findAllAvailableSlots:", { salonId, stylistId, error });
      if (error.statusCode === 400 || error.statusCode === 404) {
        throw error;
      }
      throw new CustomError(error.message || "Failed to find available slots", 500);
    }
  }

  async generateSlots(salonId: string, date: Date, stylistId: string): Promise<ITimeSlotDocument[]> {
    try {
      console.log("Generating slots for:", {
        salonId,
        date: moment(date).format('YYYY-MM-DD HH:mm:ss Z'),
        stylistId
      });

      const [salon, stylist] = await Promise.all([
        this._salonRepository.getSalonById(salonId),
        this._stylistRepository.findStylistById(stylistId)
      ]);

      if (!salon) throw new CustomError("Salon not found", 404);
      if (!stylist) throw new CustomError("Stylist not found", 404);

      const timeZone = salon.timeZone || 'Asia/Kolkata';
      const localDate = moment.tz(date, timeZone).startOf('day');
      const dayOfWeek = localDate.format('dddd');

      console.log(`Checking working hours for ${stylistId} on ${dayOfWeek}`);
      console.log(`Stylist working hours:`, stylist.workingHours);
      console.log(`Salon hours: openingTime=${salon.openingTime}, closingTime=${salon.closingTime}`);

      const workingHours = stylist.workingHours.find(wh => wh.day === dayOfWeek);
      if (!workingHours) {
        throw new CustomError(`Stylist ${stylist.name} is not available on ${dayOfWeek}`, 400);
      }

      const parseTime = (timeStr: string | undefined, defaultTime: string) => {
        if (!timeStr || !timeStr.includes(':')) {
          console.warn(`Invalid time format: ${timeStr}, using default: ${defaultTime}`);
          timeStr = defaultTime;
        }
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          console.warn(`Invalid time values: ${timeStr}, using default: ${defaultTime}`);
          const [defHours, defMinutes] = defaultTime.split(':').map(Number);
          return moment.tz(`${localDate.format('YYYY-MM-DD')} ${defaultTime}`, 'YYYY-MM-DD HH:mm', timeZone);
        }
        const time = moment.tz(`${localDate.format('YYYY-MM-DD')} ${timeStr}`, 'YYYY-MM-DD HH:mm', timeZone);
        console.log(`Parsed ${timeStr} to ${time.format('YYYY-MM-DD HH:mm:ss Z')}`);
        return time;
      };

      const stylistStart = parseTime(workingHours.startTime, '09:00');
      const stylistEnd = parseTime(workingHours.endTime, '17:00');
      const salonStart = parseTime(salon.openingTime, '09:00');
      const salonEnd = parseTime(salon.closingTime, '22:00');

      const startTime = moment.max(stylistStart, salonStart);
      const endTime = moment.min(stylistEnd, salonEnd);

      if (startTime.isSameOrAfter(endTime)) {
        throw new CustomError(`No valid working hours for ${stylist.name} on ${localDate.format('YYYY-MM-DD')}. Start: ${startTime.format('HH:mm')}, End: ${endTime.format('HH:mm')}`, 400);
      }

      console.log(`Generating slots from ${startTime.format('HH:mm')} to ${endTime.format('HH:mm')} in ${timeZone}`);

      const slots: ITimeSlot[] = [];
      let currentTime = startTime.clone();
      const slotDuration = 30;
      const coolOffPeriod = 10;

      while (currentTime.isBefore(endTime)) {
        const slotEnd = currentTime.clone().add(slotDuration, 'minutes');
        if (slotEnd.isAfter(endTime)) break;

        const slotStartUTC = currentTime.clone().utc().toDate();
        const slotEndUTC = slotEnd.clone().utc().toDate();
        console.log(`Creating slot: ${currentTime.format('HH:mm')}–${slotEnd.format('HH:mm')} IST, ${moment(slotStartUTC).utc().format('HH:mm')}–${moment(slotEndUTC).utc().format('HH:mm')} UTC`);

        slots.push({
          salon: new mongoose.Types.ObjectId(salonId),
          stylist: new mongoose.Types.ObjectId(stylistId),
          startTime: slotStartUTC,
          endTime: slotEndUTC,
          status: "available",
          version: 0,
          reservedUntil: null,
          userId:null,
          bookingId:null

        });

        currentTime = slotEnd.clone().add(coolOffPeriod, 'minutes');
      }

      const existingSlots = await this._timeSlotRepository.findAllSlots(salonId, localDate.toDate(), stylistId);
      console.log(`Found ${existingSlots.length} existing slots`, existingSlots.map(s => ({
        startTime: moment(s.startTime).tz(timeZone).format('HH:mm'),
        utcStartTime: moment(s.startTime).utc().format('HH:mm'),
        status: s.status
      })));

      const newSlots = slots.filter(newSlot => {
        return !existingSlots.some(existingSlot => 
          moment(existingSlot.startTime).isSame(moment(newSlot.startTime), 'minute') &&
          moment(existingSlot.endTime).isSame(moment(newSlot.endTime), 'minute')
        );
      });

      if (newSlots.length > 0) {
        const createdSlots = await this._timeSlotRepository.bulkCreate(newSlots);
        console.log(`Generated ${createdSlots.length} new slots`, createdSlots.map(s => ({
          _id: s._id.toString(),
          startTime: moment(s.startTime).tz(timeZone).format('HH:mm'),
          endTime: moment(s.endTime).tz(timeZone).format('HH:mm'),
          utcStartTime: moment(s.startTime).utc().format('HH:mm'),
          utcEndTime: moment(s.endTime).utc().format('HH:mm')
        })));
        return createdSlots;
      } else {
        console.log("No new slots created, existing slots found");
      }

      return [];
    } catch (error) {
      console.error("Slot generation failed:", error);
      throw error;
    }
  }

  async findConsecutiveSlots(
    salonId: string,
    serviceIds: string[],
    date: Date,
    stylistId: string,
    requiredDuration?: number
  ): Promise<ISlotGroup[]> {
    try {
      const salon = await this._salonRepository.getSalonById(salonId);
      if (!salon) throw new CustomError("Salon not found", 404);

      const stylist = await this._stylistRepository.findStylistById(stylistId);
      if (!stylist) throw new CustomError("Stylist not found", 404);

      const stylistServiceIds = salon.services.map(s => s._id.toString());
      console.log('findConsecutiveSlots:', { stylistId, serviceIds, stylistServiceIds });
      if (!serviceIds.every(id => stylistServiceIds.includes(id))) {
        const serviceNames = salon.services
          .filter((s: any) => serviceIds.includes(s._id.toString()))
          .map((s: any) => s.service);
        throw new CustomError(`Stylist ${stylist.name} does not offer all selected services: ${serviceNames.join(', ')}`, 400);
      }

      const timeZone = salon.timeZone || "Asia/Kolkata";
      const localDate = moment.tz(date, timeZone).startOf("day");

      const availableSlots = await this._timeSlotRepository.findAvailableSlots(
        salonId,
        localDate.toDate(),
        stylistId
      );

      if (availableSlots.length === 0) {
        console.log(`No available slots for ${stylistId} on ${localDate.format('YYYY-MM-DD')}`);
        return [];
      }

      availableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      const totalDuration = requiredDuration ?? salon.services
        .filter((s: any) => serviceIds.includes(s._id.toString()))
        .reduce((sum: number, s: any) => sum + (s.duration || 30), 0);

      const slotDuration = 30;
      const coolOffPeriod = 10;
      const slotsNeeded = Math.ceil(totalDuration / slotDuration);

      console.log(`Service requires ${slotsNeeded} slot(s) for ${totalDuration} minutes`);

      const slotGroups: ISlotGroup[] = [];
      for (let i = 0; i <= availableSlots.length - slotsNeeded; i++) {
        const group = availableSlots.slice(i, i + slotsNeeded);
        if (group.length === slotsNeeded) {
          let isConsecutive = true;
          for (let j = 1; j < group.length; j++) {
            const prevEnd = moment(group[j - 1].endTime);
            const currStart = moment(group[j].startTime);
            if (currStart.diff(prevEnd, 'minutes') !== coolOffPeriod) {
              isConsecutive = false;
              break;
            }
          }
          if (isConsecutive) {
            const groupDuration = moment(group[group.length - 1].endTime)
              .diff(moment(group[0].startTime), 'minutes');
            slotGroups.push({
              _id: group.map(s => s._id.toString()).join(','),
              startTime: group[0].startTime,
              endTime: group[group.length - 1].endTime,
              stylist: new mongoose.Types.ObjectId(stylistId),
              salon: new mongoose.Types.ObjectId(salonId),
              status: "available",
              slotIds: group.map(s => s._id.toString()),
              duration: groupDuration
            });
          }
        }
      }

      console.log(`Found ${slotGroups.length} slot groups for ${totalDuration} minutes`);
      return slotGroups;
    } catch (error: any) {
      console.error("Detailed findConsecutiveSlots error:", { stylistId, serviceIds, error });
      throw error;
    }
  }

  async findAvailableSlots(salonId: string, serviceIds: string[], date: Date, stylistId: string): Promise<ISlotGroup[]> {
    try {
      const salon = await this._salonRepository.getSalonById(salonId);
      if (!salon) throw new CustomError("Salon not found", 404);

      const services = salon.services.filter(s => serviceIds.includes(s._id.toString()));
      if (services.length !== serviceIds.length) {
        const serviceNames = salon.services
          .filter((s: any) => serviceIds.includes(s._id.toString()))
          .map((s: any) => s.service);
        throw new CustomError(`One or more services not found: ${serviceNames.join(', ')}`, 400);
      }

      const timeZone = salon.timeZone || "Asia/Kolkata";
      const localDate = moment.tz(date, timeZone).startOf("day");
      const existingSlots = await this._timeSlotRepository.findAllSlots(salonId, localDate.toDate(), stylistId);
      if (existingSlots.length === 0) {
        console.log(`No slots found, generating for ${stylistId} on ${localDate.format('YYYY-MM-DD')}`);
        await this.generateSlots(salonId, localDate.toDate(), stylistId);
      }

      return await this.findConsecutiveSlots(salonId, serviceIds, date, stylistId);
    } catch (error: any) {
      console.error("Detailed findAvailableSlots error:", { salonId, serviceIds, stylistId, error });
      if (error.statusCode === 400) {
        throw error;
      }
      throw new CustomError(error.message || "Failed to find available slots", 500);
    }
  }

  async updateSlotStatus(slotId: string, slotStatus: ITimeSlot["status"]): Promise<ITimeSlotDocument | null> {
    try {
      const slot = await this._timeSlotRepository.findById(slotId);
      if (!slot || slot.status !== "available") {
        throw new CustomError("Slot not found or not available", 409);
      }
      return await this._timeSlotRepository.updateSlotStatus(slotId, slotStatus, slot.version);
    } catch (error: any) {
      console.error("Error in updateSlotStatus:", error);
      throw new CustomError(error.message || "Failed to update slot status", 500);
    }
  }

  async findAvailableSlotsById(slotId: string): Promise<ITimeSlotDocument | null> {
    const slot = await this._timeSlotRepository.findById(slotId);
    if (slot && slot.status === "available" && !slot.reservedUntil) return slot;
    return null;
  }

  async findAvailableSlotsByIds(slotIds: string[]): Promise<ITimeSlotDocument[]> {
    const slots = await this._timeSlotRepository.findByIds(slotIds);
    return slots.filter((slot) => slot.status === "available" && !slot.reservedUntil);
  }

  async reserveSlotGroup(
    slotIds: string[],
    reservedUntil: Date,
    bookingId: string,
    userId: string,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const dbSession = session || (await mongoose.startSession());
    if (!session) dbSession.startTransaction();
    try {
      const slots = await this._timeSlotRepository.findByIds(slotIds, session);
      if (slots.length !== slotIds.length) {
        throw new CustomError("One or more slots not found", HttpStatus.NOT_FOUND);
      }

      console.log("Slots before reservation:", slots.map(s => ({
        _id: s._id.toString(),
        status: s.status,
        reservedUntil: s.reservedUntil?.toISOString(),
        bookingId: s.bookingId,
        userId: s.userId?.toString(),
        version: s.version
      })));

      const now = new Date();
      for (const slot of slots) {
        if (slot.status === "booked") {
          throw new CustomError("One or more slots are booked", HttpStatus.CONFLICT);
        }
        if (
          slot.status === "reserved" &&
          slot.reservedUntil &&
          slot.reservedUntil > now &&
          (slot.bookingId !== bookingId || slot.userId?.toString() !== userId)
        ) {
          console.log(`Slot ${slot._id} already reserved by another user until ${slot.reservedUntil}`);
          throw new CustomError("One or more slots are already reserved", HttpStatus.CONFLICT);
        }
      }

      const result = await this._timeSlotRepository.updateMany(
        {
          _id: { $in: slotIds },
          $or: [
            { status: "available", reservedUntil: null },
            { status: "reserved", reservedUntil: { $lte: now } },
            { status: "reserved", bookingId, userId }
          ]
        },
        { $set: { reservedUntil, status: "reserved", bookingId, userId }, $inc: { version: 1 } },
        { session: dbSession }
      );

      console.log(`Reserve slot result: matched=${result.matchedCount}, modified=${result.modifiedCount}, slotIds=${slotIds.length}`);

      if (result.matchedCount !== slotIds.length) {
        throw new CustomError("Failed to reserve one or more slots", HttpStatus.CONFLICT);
      }

      if (!session) await dbSession.commitTransaction();
      console.log(`Reserved slots ${slotIds} until ${reservedUntil.toISOString()} for booking ${bookingId}`);
    } catch (error: any) {
      if (!session) await dbSession.abortTransaction();
      console.error("Error in reserveSlotGroup:", { slotIds, reservedUntil: reservedUntil.toISOString(), bookingId, userId, error });
      throw error;
    } finally {
      if (!session) dbSession.endSession();
    }
  }

  async releaseSlots(slotIds: string[], session?: mongoose.ClientSession): Promise<void> {
    const dbSession = session || (await mongoose.startSession());
    if (!session) dbSession.startTransaction();
    try {
      const result = await this._timeSlotRepository.updateMany(
        { _id: { $in: slotIds }, status: "reserved" },
        { $set: { status: "available", reservedUntil: null, bookingId: null, userId: null }, $inc: { version: 1 } },
        { session: dbSession }
      );

      console.log(`Release slot result: matched=${result.matchedCount}, modified=${result.modifiedCount}, slotIds=${slotIds.length}`);

      if (result.matchedCount !== slotIds.length) {
        console.warn("Some slots were not released, possibly not reserved");
      }

      if (!session) await dbSession.commitTransaction();
    } catch (error: any) {
      if (!session) await dbSession.abortTransaction();
      console.error("Error in releaseSlots:", { slotIds, error });
      throw error;
    } finally {
      if (!session) dbSession.endSession();
    }
  }

  async getSlotsByIds(slotIds: string[]): Promise<ITimeSlotDocument[]> {
    return await this._timeSlotRepository.findByIds(slotIds);
  }

  async updateSlotsStatus(slotIds: string[], status: ITimeSlot["status"]): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const slots = await this._timeSlotRepository.findByIds(slotIds);
      if (slots.length !== slotIds.length) {
        throw new CustomError("One or more slots not found", HttpStatus.NOT_FOUND);
      }

      const now = new Date();
      for (const slot of slots) {
        if (slot.status === "booked" && status !== "available") {
          throw new CustomError("Cannot modify booked slot", HttpStatus.CONFLICT);
        }
        if (slot.status === "reserved" && slot.reservedUntil && slot.reservedUntil > now && status !== "booked") {
          throw new CustomError("Cannot modify reserved slot", HttpStatus.CONFLICT);
        }
      }

      const result = await this._timeSlotRepository.updateMany(
        { _id: { $in: slotIds } },
        { $set: { status, reservedUntil: null }, $inc: { version: 1 } },
        { session }
      );

      if (result.matchedCount !== slotIds.length) {
        throw new CustomError("One or more slots could not be updated", HttpStatus.CONFLICT);
      }

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default SlotService;