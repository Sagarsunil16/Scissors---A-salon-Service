import User, { IUserDocument } from "../models/User";
import { IUser } from "../Interfaces/IUser";
import { IUserRepostirory } from "../Interfaces/IUserRepository";
import { BaseRepository } from "./BaseRepository";

class UserRepository extends BaseRepository<IUserDocument> implements IUserRepostirory {
  constructor(){
    super(User)
  }
  async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
      console.log(userData,"userData")
      return await this.create(userData);
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await this.findById(id);
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

  async updateUserStatus(id:string,isActive:boolean):Promise<IUserDocument | null>{
    return await User.findByIdAndUpdate(id,{is_Active:isActive},{new:true})
  }

  async resetPassword(email:string,newPassword:string):Promise<IUserDocument | null>{
    return await User.findOneAndUpdate({email},
      {password:newPassword,otp:null,otpExpiry:null},
      {new:true}
    )
  }

  async updateOTP(email:string,otp:string,otpExpiry:Date):Promise<IUserDocument | null>{
    return await User.findOneAndUpdate({email},{otp,otpExpiry},{new:true})
  }

  async verifyOtpAndUpdate(email:string):Promise<IUserDocument | null>{
    return await User.findOneAndUpdate({email},{otp:null,otpExpiry:null,verified:true},{new:true})
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
    page: number,
    limit: number
  ): Promise<{data:IUserDocument[],totalCount:number}> {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find({ role: "User" }).skip(skip).limit(limit);
      const totalCount =  await User.countDocuments({role:"User"})
      return {data:users,totalCount};
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Could not fetch users");
    }
  }
  async totalPages():Promise<number>{
    return Math.ceil((await User.find({})).length/10)
  }

  updateUserData(id: string, userData: Partial<IUser>): Promise<IUserDocument | null> {
      return User.findByIdAndUpdate(id,{...userData},{new:true})
  }
  updateRefreshToken(id: string, refreshToken: string): Promise<IUserDocument | null> {
      return User.findByIdAndUpdate(id,{refreshToken},{new:true})
  }
}

export default UserRepository;
