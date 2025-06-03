import moment from "moment-timezone";
import { IAppointment, IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import Appointment from "../models/Appointment";
import { BaseRepository } from "./BaseRepository";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";

class AppointmentRepository extends BaseRepository<IAppointmentDocument> implements IAppointmentRepository {
  constructor() {
    super(Appointment);
  }

  async createAppointment(data: Partial<IAppointment>, session?:mongoose.ClientSession): Promise<IAppointmentDocument> {
   const appointment = new this.model(data);
  return await appointment.save({ session });
  }

  async findBySessionId(sessionId: string): Promise<IAppointmentDocument | null> {
    return this.model.findOne({ stripeSessionId: sessionId });
  }

  async findByBookingId(bookingId: string, session?: mongoose.ClientSession): Promise<IAppointmentDocument | null> {
       return this.model.findOne({ bookingId }).session(session ?? null).exec();
  }

  async getAppointmentDetails(appointmentId: string, userId: string): Promise<any> {
    console.log("Fetching appointment for:", { appointmentId, userId });
    const appointment = await this.model
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

    if (!appointment) return null;

    const timeZone = "Asia/Kolkata";
    const totalDuration = appointment.services.reduce(
      (sum: number, service: any) => sum + (service.duration || 0),
      0
    );

    const formattedSlots = appointment.slots
      .filter((slot: any) => slot)
      .map((slot: any) => {
        const start = moment.utc(slot.startTime).tz(timeZone);
        const end = moment.utc(slot.endTime).tz(timeZone);
        return {
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          formattedDate: start.format("MMMM Do YYYY"),
          formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}`,
        };
      });

    return {
      ...appointment,
      slots: formattedSlots,
      totalDuration,
      formattedCreatedAt: moment(appointment.createdAt).tz(timeZone).format("MMMM Do YYYY, h:mm a"),
    };
  }

  async getSalonAppointmentDetails(appointmentId: string, salonId: string): Promise<any> {
    console.log("Fetching salon appointment for:", { appointmentId, salonId });
    const appointment = await this.model
      .findOne({
        _id: appointmentId,
        salon: salonId,
      })
      .populate("user", "name email phone")
      .populate("salon", "salonName address phone timeZone")
      .populate("stylist", "name")
      .populate("services.service","name")
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

    if (!appointment) return null;

    const timeZone = "Asia/Kolkata";
    const totalDuration = appointment.services.reduce(
      (sum: number, service: any) => sum + (service.duration || 0),
      0
    );

    const formattedSlots = appointment.slots
      .filter((slot: any) => slot)
      .map((slot: any) => {
        const start = moment.utc(slot.startTime).tz(timeZone);
        const end = moment.utc(slot.endTime).tz(timeZone);
        return {
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          formattedDate: start.format("MMMM Do YYYY"),
          formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}`,
        };
      });

    return {
      ...appointment,
      slots: formattedSlots,
      totalDuration,
      formattedCreatedAt: moment(appointment.createdAt).tz(timeZone).format("MMMM Do YYYY, h:mm a"),
    };
  }

  async validateAppointmentOwnershipBySalon(appointmentId: string, salonId: string): Promise<boolean> {
    const exists = await this.model.exists({
      _id: appointmentId,
      salon: salonId,
    });
    return !!exists;
  }

  async getUserAppointments(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const match: any = { user: new mongoose.Types.ObjectId(userId) };

    if (status === "upcoming") {
      match.status = { $ne: "cancelled" };
    } else if (status === "past") {
      match.status = { $ne: "cancelled" };
    } else if (status) {
      match.status = status;
    }

    const pipeline: any[] = [
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
    } else if (status === "past") {
      pipeline.push({
        $match: {
          earliestSlot: { $lte: now },
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "salons",
          localField: "salon",
          foreignField: "_id",
          as: "salon",
        },
      },
      { $unwind: "$salon" },
      {
        $lookup: {
          from: "stylists",
          localField: "stylist",
          foreignField: "_id",
          as: "stylist",
        },
      },
      { $unwind: "$stylist" },
      {
        $lookup: {
          from: "timeslots",
          localField: "slots",
          foreignField: "_id",
          as: "slots",
        },
      },
      {
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
      }
    );

    const [appointments, total] = await Promise.all([
      this.model.aggregate(pipeline).exec(),
      this.model.countDocuments(match),
    ]);

    const formattedAppointments = appointments.map((appt) => {
      const timeZone = appt.salon.timeZone || "Asia/Kolkata";
      return {
        ...appt,
        slots: appt.slots.map((slot: any) => {
          const start = moment.utc(slot.startTime).tz(timeZone);
          const end = moment.utc(slot.endTime).tz(timeZone);
          return {
            ...slot,
            formattedDate: start.format("MMMM Do YYYY"),
            formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}`,
          };
        }),
      };
    });

    return {
      appointments: formattedAppointments,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getSalonAppointments(
    salonId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const match: any = { salon: new mongoose.Types.ObjectId(salonId) };

    if (status === "upcoming") {
      match.status = { $ne: "cancelled" };
    } else if (status === "past") {
      match.status = { $ne: "cancelled" };
    } else if (status) {
      match.status = status;
    }

    const pipeline: any[] = [
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
    } else if (status === "past") {
      pipeline.push({
        $match: {
          earliestSlot: { $lte: now },
        },
      });
    }

    pipeline.push(
      {
        $sort: {
          "slotDetails.startTime": -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "stylists",
          localField: "stylist",
          foreignField: "_id",
          as: "stylist",
        },
      },
      { $unwind: "$stylist" },
      {
        $lookup: {
          from: "salons",
          localField: "salon",
          foreignField: "_id",
          as: "salon",
        },
      },
      { $unwind: "$salon" },
      {
        $lookup: {
          from: "timeslots",
          localField: "slots",
          foreignField: "_id",
          as: "slots",
        },
      },
      {
        $project: {
          "user.firstname": 1,
          "user.lastname": 1,
          "user.email": 1,
          "user.phone": 1,
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
      }
    );

    const [appointments, total] = await Promise.all([
      this.model.aggregate(pipeline).exec(),
      this.model.countDocuments(match),
    ]);

    const formattedAppointments = appointments.map((appt) => {
      const timeZone = appt.salon.timeZone || "Asia/Kolkata";
      return {
        ...appt,
        slots: appt.slots.map((slot: any) => {
          const start = moment.utc(slot.startTime).tz(timeZone);
          const end = moment.utc(slot.endTime).tz(timeZone);
          return {
            ...slot,
            formattedDate: start.format("MMMM Do YYYY"),
            formattedTime: `${start.format("h:mm a")} - ${end.format("h:mm a")}`,
          };
        }),
      };
    });

    return {
      appointments: formattedAppointments,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateAppointment(
    appointmentId: string,
    updates: Partial<IAppointment>,
    options?: mongoose.QueryOptions
  ): Promise<IAppointmentDocument> {
    const appointment = await this.model
      .findByIdAndUpdate(appointmentId, updates, { new: true, ...options })
      .populate("user", "name email phone")
      .populate("salon", "salonName address phone timeZone")
      .populate("stylist", "name")
      .populate("services.service","name")
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
      throw new CustomError(Messages.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return appointment;
  }
}

export default AppointmentRepository;