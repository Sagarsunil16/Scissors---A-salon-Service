import { ITimeSlot, ITimeSlotDocument } from "./ITimeSlot";

export interface ITimeSlotRepository {
    bulkCreate(slots:ITimeSlot[]):Promise<ITimeSlotDocument[]>
    exists(filter:Record<string,any>):Promise<boolean>
    findavailableSlots(salonId:string,serviceIds:string[],date:Date,stylistId:string):Promise<ITimeSlotDocument[]>
}