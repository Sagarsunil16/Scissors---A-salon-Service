import User, { IUserDocument } from "../models/User";
import { IUser } from "../Interfaces/User/IUser";
import { IUserRepository } from "../Interfaces/User/IUserRepository";
import { BaseRepository } from "./BaseRepository";

class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(User);
  }

  async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
    return await this.model.create(userData);
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await this.model.findById(id).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt').lean().exec()
  }

  async getUserRawById(id:string):Promise<IUserDocument | null>{
    return await this.model.findById(id).lean()
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await this.model.findOne({ email }).select('-otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .lean()
      .exec();
  }
  async getUserRawByEmail(email: string): Promise<IUserDocument | null> {
       return await this.model.findOne({email:email}).lean()
  }

  async deleteUser(id: string): Promise<IUserDocument | null> {
    return await this.model.findByIdAndDelete(id).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .lean()
      .exec();
  }

  async updateUserOtp(email: string, otp: string, otpExpiry: Date): Promise<IUserDocument | null> {
    return await this.findOneAndUpdate({ email }, { otp, otpExpiry });
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(id, { is_Active: isActive },{new:true}).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .lean()
      .exec();
  }

  async resetPassword(email: string, newPassword: string): Promise<IUserDocument | null> {
    return await this.findOneAndUpdate(
      { email },
      { password: newPassword, otp: null, otpExpiry: null }
    );
  }

async getUserByIdForAuth(id: string): Promise<IUserDocument | null> {
  return await this.model
    .findById(id)
    .select('password')
    .lean()
    .exec();
}

  async verifyOtpAndUpdate(email: string): Promise<IUserDocument | null> {
    return await this.findOneAndUpdate(
      { email },
      { otp: null, otpExpiry: null, verified: true }
    );
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(id, updateData,{new:true}).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .lean()
      .exec();;
  }

  async changePassword(id: string, newPassword: string): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(id, { password: newPassword },{new:true}).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .lean()
      .exec();;
  }

  async getAllUsers(page: number, limit: number, query: any): Promise<{ data: IUserDocument[]; totalCount: number }> {
    const finalQuery = { ...query, role: 'User' };
    const skip = (page - 1) * limit;
    const data = await this.model
      .find(finalQuery)
      .select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    const totalCount = await this.model.countDocuments(finalQuery);
    return { data, totalCount };
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<IUserDocument | null> {
    return await this.model
      .findByIdAndUpdate(id, { refreshToken }, { new: true })
      .select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
      .lean()
      .exec();
  }

  async countActiveUsers(): Promise<number> {
      return await this.model.countDocuments({role:"User",is_Active:true})
  }
}

export default UserRepository