import { IUser } from "./IUser";
import { IUserDocument } from "../../models/User";


export interface IUserRepository {
    createUser(userData:Partial<IUser>):Promise<IUserDocument>;
    getUserById(id:string):Promise<IUserDocument | null>;
    getUserByEmail(email:string):Promise<IUserDocument | null>;   
    deleteUser(id:string):Promise<IUserDocument | null>;
    getAllUsers(page:number,limit:number,query:any):Promise<{data:IUserDocument[],totalCount:number}>
    updateUserOtp(email:string,otp:string,otpExpiry:Date):Promise<IUserDocument | null>;
    resetPassword(email:string,newPassword:string):Promise<IUserDocument | null>
    updateUser(id:string,updatedData:Partial<IUser>):Promise<IUserDocument | null>;
    changePassword(id:string,newPassword:string):Promise<IUserDocument | null>
    updateUserStatus(id:string,isActive:boolean):Promise<IUserDocument | null>
    verifyOtpAndUpdate(email:string):Promise<IUserDocument | null>
    updateRefreshToken(id:string,refreshToken:string):Promise<IUserDocument | null>
    countActiveUsers():Promise<number>
}