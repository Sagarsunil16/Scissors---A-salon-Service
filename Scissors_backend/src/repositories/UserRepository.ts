import User, { IUserDocument } from "../models/User";
import { IUser } from "../Interfaces/User/IUser";
import { IUserRepository } from "../Interfaces/User/IUserRepository";
import { BaseRepository } from "./BaseRepository";

class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(User);
  }

  async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
    return await this.create(userData);
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await this.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await this.findOne({ email });
  }

  async deleteUser(id: string): Promise<IUserDocument | null> {
    return await this.deleteById(id);
  }

  async updateUserOtp(email: string, otp: string, otpExpiry: Date): Promise<IUserDocument | null> {
    return await this.findOneAndUpdate({ email }, { otp, otpExpiry });
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<IUserDocument | null> {
    return await this.updateById(id, { is_Active: isActive });
  }

  async resetPassword(email: string, newPassword: string): Promise<IUserDocument | null> {
    return await this.findOneAndUpdate(
      { email },
      { password: newPassword, otp: null, otpExpiry: null }
    );
  }

  async verifyOtpAndUpdate(email: string): Promise<IUserDocument | null> {
    return await this.findOneAndUpdate(
      { email },
      { otp: null, otpExpiry: null, verified: true }
    );
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    return await this.updateById(id, updateData);
  }

  async changePassword(id: string, newPassword: string): Promise<IUserDocument | null> {
    return await this.updateById(id, { password: newPassword });
  }

  async getAllUsers(page: number, limit: number, query: any): Promise<{ data: IUserDocument[]; totalCount: number }> {
    const finalQuery = { ...query, role: "User" };
    return await this.findAll(finalQuery, page, limit);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<IUserDocument | null> {
    return await this.updateById(id, { refreshToken });
  }

  async countActiveUsers(): Promise<number> {
      return await this.model.countDocuments({role:"User",is_Active:true})
  }
}

export default UserRepository