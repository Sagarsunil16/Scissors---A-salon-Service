import User, { IUserDocument } from "../models/User";
import { IUser } from "../Interfaces/IUser";
import { IUserRepostirory } from "../Interfaces/IUserRepository";

class UserRepository implements IUserRepostirory {
  async createUser(userData: IUser): Promise<IUserDocument> {
    return await User.create(userData);
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await User.findOne({ email });
  }

  async deleteUser(id: string): Promise<IUserDocument | null> {
    return await User.findByIdAndDelete(id);
  }

  async updateUserOtp(email:string,otp:string,otpExpiry:Date):Promise<IUserDocument | null>{
    return await User.findOneAndUpdate(
      {email},
      {otp,otpExpiry},
      {new:true}
    );
  }

  async resetPassword(email:string,newPassword:string):Promise<IUserDocument | null>{
    return await User.findOneAndUpdate({email},
      {password:newPassword,otp:null,otpExpiry:null},
      {new:true}
    )
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUserDocument | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async changePassword(id:string,newPassword:string){
    return await User.findByIdAndUpdate(id,{password:newPassword},{new:true})
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<IUserDocument[]> {
    try {
      const skip = (page - 1) * limit;
      return await User.find({ role: "User" }).skip(skip).limit(limit);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Could not fetch users");
    }
  }
  
}

export default UserRepository;
