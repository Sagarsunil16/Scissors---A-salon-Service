export type UserRole = "User" | "Admin"
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
    phone:string,
    password:string,
    address:Address,
    role:UserRole,
    verified:boolean,
    is_Active:boolean,
    otp?:string | null,
    otpExpiry?:Date |null,
    refreshToken:string,
}