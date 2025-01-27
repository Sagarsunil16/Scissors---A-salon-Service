export type UserRole = "User" | "Admin"
export type UserStatus = "Active" | "inactive"
export interface Address {
    areaStreet: string;
    city: string;
    state: string;
    pinCode: string;
  }
export interface IUser{
    firstname:string,
    lastname:string,
    email:string,
    phone:number,
    password:string,
    address:Address,
    role:UserRole,
    is_Active:UserRole,
    otp?:string | null,
    otpExpiry?:Date |null
}