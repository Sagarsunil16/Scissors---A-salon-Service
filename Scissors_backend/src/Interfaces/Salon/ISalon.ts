import { Address } from "../IUser"
export interface ISalon{
    salonName:string,
    email:string,
    phone:number,
    password:string,
    address:Address,
    openingTime:string,
    closingTime:string,
    verified:boolean,
    is_Active:boolean,
    otp?:string | null,
    otpExpiry?:Date |null
}