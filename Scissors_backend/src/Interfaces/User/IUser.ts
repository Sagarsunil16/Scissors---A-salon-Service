export type UserRole = "User" | "Admin"
export interface Address {
  
    areaStreet: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
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
    refreshToken:string | null,
    refreshTokenExpiresAt:Date | null
    googleLogin:boolean
}