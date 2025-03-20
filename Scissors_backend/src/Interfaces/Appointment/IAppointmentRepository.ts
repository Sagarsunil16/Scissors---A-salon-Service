import { IAppointment, IAppointmentDocument } from "./IAppointment";

export interface IAppointmentRepository{
    create(appointment:IAppointment):Promise<IAppointmentDocument>
    // findById(id: string): Promise<IAppointmentDocument | null>;
    // findByUser(userId: string): Promise<IAppointmentDocument[]>;
    // updateStatus(id: string, status: string): Promise<IAppointmentDocument | null>;
    // delete(id: string): Promise<void>;
}