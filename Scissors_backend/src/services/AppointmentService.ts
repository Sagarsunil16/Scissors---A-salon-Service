import { AppointmentStatus, IAppointment, IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import CustomError from "../Utils/cutsomError";
import mongoose from "mongoose";

class AppointmentService{
    private repository: IAppointmentRepository
    private slotRepository: ITimeSlotRepository
    constructor(repository:IAppointmentRepository,slotRepository:ITimeSlotRepository){
        this.repository = repository,
        this.slotRepository = slotRepository
    }

    async createAppointment(appointment:IAppointment):Promise<IAppointmentDocument>{
        return this.repository.createAppointment(appointment)
    }

    async getAppointmentDetails(appointmentId:string,userId:string):Promise<any>{
        const appointment =  await this.repository.getAppointmentDetails(appointmentId,userId)
        return appointment
    }

    async getUserAppointments(
        userId: string,
        status?: string,
        page: number = 1,
        limit: number = 10
    ) {
        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new CustomError('Invalid user ID format', 400);
        }

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'upcoming', 'past'];
        if (status && !validStatuses.includes(status)) {
            throw new CustomError(`Invalid status. Allowed values: ${validStatuses.join(', ')}`, 400);
        }

        // Validate pagination
        if (page < 1 || limit < 1 || limit > 100) {
            throw new CustomError('Invalid pagination. Page and limit must be positive numbers with limit ≤ 100', 400);
        }

        // Business rule: Cancelled appointments usually don't need pagination
        if (status === 'cancelled' && page > 1) {
            return {
                appointments: [],
                total: 0,
                page: 1,
                pages: 1,
                message: 'Cancelled appointments typically don\'t require pagination'
            };
        }

        const result = await this.repository.getUserAppointments(userId, status, page, limit);

        if (result.appointments.length === 0) {
            return {
                ...result,
                message: status 
                    ? `No ${status} appointments found` 
                    : 'No appointments found'
            };
        }

        return result;
    }

    async getSalonAppointments(
        salonId:string,
        status?:string,
        page:number=1,
        limit:number=10
    ){
        if (!mongoose.Types.ObjectId.isValid(salonId)) {
            throw new CustomError('Invalid salon ID format', 400);
        }

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'upcoming', 'past'];
        if (status && !validStatuses.includes(status)) {
            throw new CustomError(`Invalid status. Allowed values: ${validStatuses.join(', ')}`, 400);
        }

        if (page < 1 || limit < 1 || limit > 100) {
            throw new CustomError('Invalid pagination. Page and limit must be positive numbers with limit ≤ 100', 400);
        }
        const result = await this.repository.getSalonAppointments(salonId, status, page, limit);

        if (result.appointments.length === 0) {
            return {
                ...result,
                message: status 
                    ? `No ${status} appointments found for this salon` 
                    : 'No appointments found for this salon'
            };
        }

        return result;
    }

    async cancelAppointment(appointmentId: string, salonId: string) {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new CustomError('Invalid appointment ID', 400);
        }

        const ownershipValid = await this.repository.validateAppointmentOwnershipBySalon(appointmentId, salonId);
        if (!ownershipValid) {
            throw new CustomError('You are not authorized to cancel this appointment', 403);
        }

        const appointment = await this.repository.getSalonAppointmentDetails(appointmentId, salonId);
        if (!appointment) {
            throw new CustomError('Appointment not found', 404);
        }

        if (appointment.status === 'cancelled') {
            throw new CustomError('Appointment is already cancelled', 400);
        }

        if (appointment.status === 'completed') {
            throw new CustomError('Cannot cancel a completed appointment', 400);
        }
       
        const canceledAppointment = await this.slotRepository.updateSlotStatus(appointment.slot._id,"available");
        console.log(canceledAppointment,"appointment cancceled")
        return this.repository.updateAppointment(appointmentId, { status: AppointmentStatus.Cancelled });

    }

    async completeAppointment(appointmentId: string, salonId: string) {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new CustomError('Invalid appointment ID', 400);
        }

        const ownershipValid = await this.repository.validateAppointmentOwnershipBySalon(appointmentId, salonId);
        if (!ownershipValid) {
            throw new CustomError('You are not authorized to complete this appointment', 403);
        }

        const appointment = await this.repository.getSalonAppointmentDetails(appointmentId, salonId);
        if (!appointment) {
            throw new CustomError('Appointment not found', 404);
        }

        if (appointment.status === 'completed') {
            throw new CustomError('Appointment is already completed', 400);
        }

        if (appointment.status === 'cancelled') {
            throw new CustomError('Cannot complete a cancelled appointment', 400);
        }

        return this.repository.updateAppointment(appointmentId, { status: AppointmentStatus.Completed });
    }

    async cancelAppointmentByUser(appointmentId:string,userId:string){
        const appointment = await this.repository.getAppointmentDetails(appointmentId,userId)
        if(!appointment){
            throw new CustomError('Appointment not found', 404);
        }
        if (appointment.status === 'cancelled') {
            throw new CustomError('Appointment is already cancelled', 400);
        }

        if (appointment.status === 'completed') {
            throw new CustomError('Cannot cancel a completed appointment', 400);
        }
        console.log(appointment,"appointmentsssss")
        const canceledAppointment = await this.slotRepository.updateSlotStatus(appointment.slot._id,"available");
        console.log(canceledAppointment,"appointment cancceled")
        return this.repository.updateAppointment(appointmentId, { status: AppointmentStatus.Cancelled });
    }

    
}

export default AppointmentService