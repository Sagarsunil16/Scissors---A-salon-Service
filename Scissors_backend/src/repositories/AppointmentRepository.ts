import moment from "moment-timezone";
import { IAppointment, IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import Appointment from "../models/Appointment";
import { BaseRepository } from "./BaseRepository";
import mongoose from "mongoose";
import CustomError from "../Utils/cutsomError";
import Service from "../models/Service";

class AppointmentRepositry extends BaseRepository<IAppointmentDocument> implements IAppointmentRepository{
    constructor(){
        super(Appointment)
    }

    async createAppointment(data: Partial<IAppointment>): Promise<IAppointmentDocument> {
        return await this.create(data)
    }

    async findBySessionId(sessionId: string): Promise<IAppointmentDocument | null> {
        return Appointment.findOne({stripeSessionId:sessionId})
    }
    async getAppointmentDetails(appointmentId: string, userId: string): Promise<any> {
        console.log("Fetching appointment for:", { appointmentId, userId }); 
        const appointment =  await Appointment.findOne({
            _id:appointmentId,
            user:userId
        }).populate('user','name email phone')
        .populate('salon','salonName address phone')
        .populate('stylist','name')
        .populate('services.service','name')
        .populate({
            path: 'slot',
            select: 'startTime endTime',
            transform:(doc)=>{
                if(doc){
                    const tz = 'UTC';
                        const start = moment(doc.startTime).tz(tz);
                        const end = moment(doc.endTime).tz(tz);
                        return {
                            _id:doc._id,
                            startTime: doc.startTime,
                            endTime: doc.endTime,
                            formattedDate: start.format('MMMM Do YYYY'),
                            formattedTime: `${start.format('h:mm a')} - ${end.format('h:mm a')}`
                        };
                    }
                return doc;
            }
        }).lean();

        console.log("Fetched appointment:", appointment); 

        if (!appointment) return null;

        const totalDuration = appointment.services.reduce(
            (sum: number, service: any) => sum + service.duration, 0
        );

        return {
            ...appointment,
            totalDuration,
            formattedCreatedAt: moment(appointment.createdAt).tz("UTC").format('MMMM Do YYYY, h:mm a')
        };
    }

    async getSalonAppointmentDetails(appointmentId: string, salonId: string): Promise<any> {
        console.log("Fetching salon appointment for:", { appointmentId, salonId });
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            salon: salonId
        })
            .populate('user', 'name email phone')
            .populate('salon', 'salonName address phone')
            .populate('stylist', 'name')
            .populate('services.service', 'name')
            .populate({
                path: 'slot',
                select: '_id startTime endTime',
                transform: (doc) => {
                    if (doc) {
                        const tz = 'UTC'; 
                        const start = moment(doc.startTime).tz(tz);
                        const end = moment(doc.endTime).tz(tz);
                        return {
                            _id: doc._id,
                            startTime: doc.startTime,
                            endTime: doc.endTime,
                            formattedDate: start.format('MMMM Do YYYY'),
                            formattedTime: `${start.format('h:mm a')} - ${end.format('h:mm a')}`
                        };
                    }
                    return doc;
                }
            })
            .lean();

        console.log("Fetched salon appointment:", appointment);

        if (!appointment) return null;

        const totalDuration = appointment.services.reduce(
            (sum: number, service: any) => sum + service.duration, 0
        );

        return {
            ...appointment,
            totalDuration,
            formattedCreatedAt: moment(appointment.createdAt).tz('UTC').format('MMMM Do YYYY, h:mm a')
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

        const query: any = { user: userId };

        // Status filtering
        if (status === 'upcoming') {
            query['slot.startTime'] = { $gt: now };
            query.status = { $ne: 'cancelled' };
        } else if (status === 'past') {
            query['slot.startTime'] = { $lte: now };
            query.status = { $ne: 'cancelled' };
        } else if (status) {
            query.status = status;
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .sort({ 'createdAt': -1 })
                .skip(skip)
                .limit(limit)
                .populate('salon', 'salonName address phone services')
                .populate('stylist', 'name specialization')
                .populate('services.service', 'name price duration')
                .populate({
                    path: 'slot',
                    select: 'startTime endTime'
                })
                .lean(),

            this.model.countDocuments(query)
        ]);

        return {
            appointments,
            total,
            page,
            pages: Math.ceil(total / limit)
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

        const query: any = { salon: salonId };

        // Status filtering
        if (status === 'upcoming') {
            query['slot.startTime'] = { $gt: now };
            query.status = { $ne: 'cancelled' };
        } else if (status === 'past') {
            query['slot.startTime'] = { $lte: now };
            query.status = { $ne: 'cancelled' };
        } else if (status) {
            query.status = status;
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .sort({ 'slot.startTime': -1 }) // Sort by start time, descending
                .skip(skip)
                .limit(limit)
                .populate('user', 'firstname lastname email phone')
                .populate('stylist', 'name specialization')
                .populate({
                    path: 'salon', 
                    select: 'services'
                })
                .populate({
                    path: 'services.service',
                    select: 'name price duration'
                })
                .populate({
                    path: 'slot',
                    select: 'startTime endTime',
                    transform: (doc) => {
                        if (doc) {
                            const tz = 'UTC'; // Replace with your salon’s timezone
                            const start = moment(doc.startTime).tz(tz);
                            const end = moment(doc.endTime).tz(tz);
                            return {
                                startTime: doc.startTime,
                                endTime: doc.endTime,
                                formattedDate: start.format('MMMM Do YYYY'),
                                formattedTime: `${start.format('h:mm a')} - ${end.format('h:mm a')}`
                            };
                        }
                        return doc;
                    }
                })
                .lean(),
            this.model.countDocuments(query)
        ]);

        return {
            appointments,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }

    async updateAppointment(appointmentId: string, updates: Partial<IAppointment>): Promise<IAppointmentDocument> {
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            updates,
            { new: true }
        )
            .populate('user', 'name email phone')
            .populate('salon', 'salonName address phone')
            .populate('stylist', 'name')
            .populate('services', 'name')
            .populate({
                path: 'slot',
                select: 'startTime endTime',
                transform: (doc) => {
                    if (doc) {
                        const tz = 'UTC'; 
                        const start = moment(doc.startTime).tz(tz);
                        const end = moment(doc.endTime).tz(tz);
                        return {
                            startTime: doc.startTime,
                            endTime: doc.endTime,
                            formattedDate: start.format('MMMM Do YYYY'),
                            formattedTime: `${start.format('h:mm a')} - ${end.format('h:mm a')}`
                        };
                    }
                    return doc;
                }
            });

        if (!appointment) {
            throw new CustomError('Appointment not found', 404);
        }
        return appointment;
    }


}

export default AppointmentRepositry