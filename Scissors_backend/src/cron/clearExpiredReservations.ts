import cron, { ScheduledTask } from 'node-cron'
import { ITimeSlotRepository } from '../Interfaces/TimeSlot/ITimeSlotRepository';

export class ExpiredReservations{
    private _task:ScheduledTask;
    constructor(private timeSlotRepository:ITimeSlotRepository){
        this._task = cron.schedule("*/5 * * * *", async()=>{
    try {
         console.log("Running cron at:", new Date().toISOString());
        await this.timeSlotRepository.clearExpiredReservations()
        console.log("Cleared Expired Slot reservations")
    } catch (error) {
        console.error("Error clearing expired reservation",error)
    }
})} 

    start(){
        this._task.start()
    }

    stop(){
        this._task.stop()
    }
}
