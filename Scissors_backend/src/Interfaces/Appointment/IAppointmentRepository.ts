import mongoose from "mongoose";
import { IAppointment, IAppointmentDocument } from "./IAppointment";

export interface IAppointmentRepository {
  createAppointment(
    appointment: Partial<IAppointment>
  ): Promise<IAppointmentDocument>;
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
  }>;

  getSalonAppointments(
    salonId: string,
    status?: string,
    page?: number,
    limit?: number
  ): Promise<{
    appointments: any[];
    total: number;
    page: number;
    pages: number;
  }>;

  updateAppointment(
    appointmentId: string,
    updates: Partial<IAppointment>,
    options?:mongoose.QueryOptions
  ): Promise<IAppointmentDocument>;
  getSalonAppointmentDetails(appointmentId: string, salonId: string): Promise<any>;
  validateAppointmentOwnershipBySalon(appointmentId: string, salonId: string): Promise<boolean>;
  findBySessionId(sessionId:string):Promise<IAppointmentDocument | null>
  // findById(id: string): Promise<IAppointmentDocument | null>;
  // findByUser(userId: string): Promise<IAppointmentDocument[]>;
  // updateStatus(id: string, status: string): Promise<IAppointmentDocument | null>;
  // delete(id: string): Promise<void>;
}
