import { IUserDocument } from "../../models/User";
import { IUser } from "./IUser";

interface IAddress {
    areaStreet: string;
    city: string;
    state: string;
    pincode: string;
  }
  
  export interface IUserService {
    createUser(userData: IUser): Promise<IUserDocument>;
    getUserById(id: string): Promise<IUserDocument | null>;
    getUserByEmail(email: string): Promise<IUserDocument | null>;
    deleteUser(id: string): Promise<IUserDocument | null>;
    loginUser(
      email: string,
      password: string
    ): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string } | null>;
    googleLogin(idToken: string): Promise<{ user: IUserDocument; token: string; refreshToken: string }>;
    signOut(refreshToken: string): Promise<any>;
    sendOtp(email: string): Promise<string>;
    getAllUsers(
      page: number,
      limit: number,
      search: string
    ): Promise<{ data: IUserDocument[]; totalCount: number }>;
    verifyOTP(email: string, otp: string): Promise<string>;
    resetPassword(email: string, newPassword: string): Promise<string>;
    updateUser(id: string, updatedData: Partial<IUser>, isAdmin: boolean): Promise<IUserDocument | null>;
    changePassword(id: string, currentPassword: string, newPassword: string): Promise<string>;
    updateUserStatus(id: string, isActive: boolean): Promise<IUserDocument | null>;
    updateRefreshToken(id: string, refreshToken: string): Promise<IUserDocument | null>;
  }