import { AppointmentStatus, IAppointment, IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import CustomError from "../Utils/cutsomError";
import mongoose from "mongoose";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";

class AppointmentService implements IAppointmentService {
  private _repository: IAppointmentRepository;
  private _slotRepository: ITimeSlotRepository;

  constructor(repository: IAppointmentRepository, slotRepository: ITimeSlotRepository) {
    this._repository = repository;
    this._slotRepository = slotRepository;
  }

  async createAppointment(appointment: IAppointment): Promise<IAppointmentDocument> {
    return this._repository.createAppointment(appointment);
  }

  async getAppointmentDetails(appointmentId: string, userId: string): Promise<any> {
    const appointment = await this._repository.getAppointmentDetails(appointmentId, userId);
    return appointment;
  }

  async getUserAppointments(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError(Messages.INVALID_USER_ID, HttpStatus.BAD_REQUEST);
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "upcoming", "past"];
    if (status && !validStatuses.includes(status)) {
      throw new CustomError(
        `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (page < 1 || limit < 1 || limit > 100) {
      throw new CustomError(
        Messages.INVALID_PAGINATION_PARAMS,
        HttpStatus.BAD_REQUEST
      );
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

    const result = await this._repository.getUserAppointments(userId, status, page, limit);

    if (result.appointments.length === 0) {
      return {
        ...result,
        message: status
          ? `No ${status} appointments found`
          : Messages.USER_APPOINTMENTS_NOT_FOUND,
      };
    }

    return result;
  }

  async getSalonAppointments(salonId: string, status?: string, page: number = 1, limit: number = 10) {
    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      throw new CustomError(Messages.INVALID_SALON_ID, HttpStatus.BAD_REQUEST);
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "upcoming", "past"];
    if (status && !validStatuses.includes(status)) {
      throw new CustomError(
        `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (page < 1 || limit < 1 || limit > 100) {
      throw new CustomError(
        Messages.INVALID_PAGINATION_PARAMS,
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this._repository.getSalonAppointments(salonId, status, page, limit);

    if (result.appointments.length === 0) {
      return {
        ...result,
        message: status
          ? `No ${status} appointments found for this salon`
          : Messages.SALON_APPOINTMENTS_NOT_FOUND,
      };
    }

    return result;
  }

  async cancelAppointment(appointmentId: string, salonId: string) {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new CustomError(Messages.INVALID_APPOINTMENT_ID, HttpStatus.BAD_REQUEST);
      }

      const ownershipValid = await this._repository.validateAppointmentOwnershipBySalon(
        appointmentId,
        salonId
      );
      if (!ownershipValid) {
        throw new CustomError(
          Messages.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED
        );
      }

      const appointment = await this._repository.getSalonAppointmentDetails(appointmentId, salonId);
      if (!appointment) {
        throw new CustomError(Messages.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (appointment.status === AppointmentStatus.Cancelled) {
        throw new CustomError(
          Messages.APPOINTMENT_ALREADY_CANCELLED,
          HttpStatus.BAD_REQUEST
        );
      }

      if (appointment.status === AppointmentStatus.Completed) {
        throw new CustomError(
          Messages.APPOINTMENT_CANCEL_FAILED,
          HttpStatus.BAD_REQUEST
        );
      }

      // Update all slots to 'available'
      for (const slot of appointment.slots) {
        const slotDoc = await this._slotRepository.findById(slot._id.toString());
        if (!slotDoc) {
          throw new CustomError(Messages.SLOT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        const updatedSlot = await this._slotRepository.updateSlotStatus(
          slot._id.toString(),
          "available",
          slotDoc.version,
          { session: dbSession }
        );
        if (!updatedSlot) {
          throw new CustomError(
            Messages.SLOT_CONCURRENT_MODIFICATION,
            HttpStatus.CONFLICT
          );
        }
      }

      // Update appointment status to 'cancelled'
      const updatedAppointment = await this._repository.updateAppointment(
        appointmentId,
        { status: AppointmentStatus.Cancelled },
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      return updatedAppointment;
    } catch (error: any) {
      await dbSession.abortTransaction();
      throw new CustomError(
        error.message || Messages.APPOINTMENT_CANCEL_FAILED,
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      dbSession.endSession();
    }
  }

  async completeAppointment(appointmentId: string, salonId: string) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new CustomError(Messages.INVALID_APPOINTMENT_ID, HttpStatus.BAD_REQUEST);
    }

    const ownershipValid = await this._repository.validateAppointmentOwnershipBySalon(
      appointmentId,
      salonId
    );
    if (!ownershipValid) {
      throw new CustomError(
        Messages.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED
      );
    }

    const appointment = await this._repository.getSalonAppointmentDetails(appointmentId, salonId);
    if (!appointment) {
      throw new CustomError(Messages.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (appointment.status === AppointmentStatus.Completed) {
      throw new CustomError(
        Messages.APPOINTMENT_ALREADY_COMPLETED,
        HttpStatus.BAD_REQUEST
      );
    }

    if (appointment.status === AppointmentStatus.Cancelled) {
      throw new CustomError(
        Messages.APPOINTMENT_COMPLETE_FAILED,
        HttpStatus.BAD_REQUEST
      );
    }

    return this._repository.updateAppointment(appointmentId, {
      status: AppointmentStatus.Completed,
    });
  }

  async cancelAppointmentByUser(appointmentId: string, userId: string) {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new CustomError(Messages.INVALID_APPOINTMENT_ID, HttpStatus.BAD_REQUEST);
      }

      const appointment = await this._repository.getAppointmentDetails(appointmentId, userId);
      if (!appointment) {
        throw new CustomError(Messages.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (appointment.status === AppointmentStatus.Cancelled) {
        throw new CustomError(
          Messages.APPOINTMENT_ALREADY_CANCELLED,
          HttpStatus.BAD_REQUEST
        );
      }

      if (appointment.status === AppointmentStatus.Completed) {
        throw new CustomError(
          Messages.APPOINTMENT_CANCEL_FAILED,
          HttpStatus.BAD_REQUEST
        );
      }

      // Update all slots to 'available'
      for (const slot of appointment.slots) {
        const slotDoc = await this._slotRepository.findById(slot._id.toString());
        if (!slotDoc) {
          throw new CustomError(Messages.SLOT_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        const updatedSlot = await this._slotRepository.updateSlotStatus(
          slot._id.toString(),
          "available",
          slotDoc.version,
          { session: dbSession }
        );
        if (!updatedSlot) {
          throw new CustomError(
            Messages.SLOT_CONCURRENT_MODIFICATION,
            HttpStatus.CONFLICT
          );
        }
      }

      // Update appointment status to 'cancelled'
      const updatedAppointment = await this._repository.updateAppointment(
        appointmentId,
        { status: AppointmentStatus.Cancelled },
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      return updatedAppointment;
    } catch (error: any) {
      await dbSession.abortTransaction();
      throw new CustomError(
        error.message || Messages.APPOINTMENT_CANCEL_FAILED,
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      dbSession.endSession();
    }
  }

  async updatedAppointmentReview(appointmentId: string) {
    return await this._repository.updateAppointment(appointmentId, { isReviewed: true });
  }
}

export default AppointmentService;