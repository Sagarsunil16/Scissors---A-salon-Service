import mongoose from "mongoose";
import { IAppointment, AppointmentStatus, IAppointmentDocument } from "./IAppointment";

export interface IAppointmentService {
  createAppointment(appointment: Partial<IAppointment>, session?: mongoose.ClientSession): Promise<IAppointmentDocument>;
  getAppointmentDetails(appointmentId: string, userId: string): Promise<any>;
  getUserAppointments(
    userId: string,
    status?: string,
    page?: number,
    limit?: number
  ): Promise<{
    appointments: IAppointmentDocument[];
    total: number;
    page: number;
    pages: number;
    message?: string;
  }>;
  getSalonAppointments(
    salonId: string,
    status?: string,
    page?: number,
    limit?: number
  ): Promise<{
    appointments: IAppointmentDocument[];
    total: number;
    page: number;
    pages: number;
    message?: string;
  }>;
  cancelAppointment(appointmentId: string, salonId: string): Promise<{ appointment: IAppointmentDocument; message: string }>;
  completeAppointment(appointmentId: string, salonId: string): Promise<IAppointmentDocument>;
  cancelAppointmentByUser(appointmentId: string, userId: string): Promise<{ appointment: IAppointmentDocument; message: string }>;
  updatedAppointmentReview(appointmentId: string): Promise<IAppointmentDocument>;
  updateAppointmentByBookingId(bookingId: string, update: Partial<IAppointment>, session?: mongoose.ClientSession): Promise<IAppointmentDocument>;
}