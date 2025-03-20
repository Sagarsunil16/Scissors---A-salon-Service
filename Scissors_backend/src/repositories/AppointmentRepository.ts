import { IAppointment, IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import Appointment from "../models/Appointment";
import { BaseRepository } from "./BaseRepository";

class AppointmentRepositry extends BaseRepository<IAppointmentDocument> implements IAppointmentRepository{
    constructor(){
        super(Appointment)
    }

    async create(data: Partial<IAppointment>): Promise<IAppointmentDocument> {
        return await this.create(data)
    }
}

export default AppointmentRepositry