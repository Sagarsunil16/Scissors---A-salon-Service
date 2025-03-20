import { IAppointment, IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";

class AppointmentService{
    private repository: IAppointmentRepository
    constructor(repository:IAppointmentRepository){
        this.repository = repository
    }

    async createAppointment(appointment:IAppointment):Promise<IAppointmentDocument>{
        return this.repository.create(appointment)
    }
}

export default AppointmentService