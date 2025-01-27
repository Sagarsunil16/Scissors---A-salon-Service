import { IUserRepostirory } from "../Interfaces/IUserRepository";
import bcrypt from "bcryptjs";
import { IUser } from "../Interfaces/IUser";
import { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import { sendOtpEmail,generateOtp } from "../Utils/otp";

class UserService {
    private repository:IUserRepostirory

    constructor(repository:IUserRepostirory){
        this.repository = repository
    }

    async createUser(userData: IUser): Promise<IUserDocument> {
        userData.password = await bcrypt.hash(userData.password, 10);
        return await this.repository.createUser(userData);
    }

    async getUserById(id: string): Promise<IUserDocument | null> {
        return await  this.repository.getUserById(id);
    }

    async getUserByEmail(email: string): Promise<IUserDocument | null> {
        return await  this.repository.getUserByEmail(email);
    }

    
    async deleteUser(id: string): Promise<IUserDocument | null> {
        return await  this.repository.deleteUser(id);
    }

    async loginUser(
        email: string,
        password: string
    ): Promise<{ user: IUserDocument; token: string } | null> {
        const user = await  this.repository.getUserByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
        throw new Error("Invalid email or password");
        }
        const token = jwt.sign({ id: user._id }, process.env.JWt_SECRET as string, {
        expiresIn: "1h",
        });
        return { user, token };
    }

    async sendOtp(email:string):Promise<string>{
        const user = await this.repository.getUserByEmail(email)
        if(!user){
            throw new Error("User not found");
        }
        const otp = generateOtp()
        const otpExpiry = new Date(Date.now() + 1 * 60 * 1000) // 1minutes
        await this.repository.updateUserOtp(email,otp,otpExpiry)
        await sendOtpEmail(email,otp)
        return "OTP Sent to your email."
    }

    async getAllUsers(page:number=1,limit:number=10):Promise<IUserDocument[] | null>{
        return await this.repository.getAllUsers(page,limit)
    }

    async verifyOTP(email:string,otp:string):Promise<boolean>{
            const user = await this.repository.getUserByEmail(email)
            if(!user){
                throw new Error("User not found")
            }
            if(!user.otp || !user.otpExpiry || user.otp!==otp){
                throw new Error("Invalid or expired OTP")
            }
            if(user.otpExpiry< new Date()){
                throw new Error("OTP has Expired")
            }
            return true
    }
    async resetPasssword(email:string,newPassword:string):Promise<string>{
        const user = this.repository.getUserByEmail(email)
        if(!user){
            throw new Error("User not Found")
        }
        const hashedPassword =  await bcrypt.hash(newPassword,10)
        await this.repository.resetPassword(email,hashedPassword)
        return "Password reset successfully."
    }

    async updateUser(
        id: string,
        updatedData: Partial<IUser>
    ): Promise<IUserDocument | null> {
        if(!updatedData.firstname || !updatedData.lastname || !updatedData.address){
            console.log("Error 1")
            throw new Error("Firstname, Lastname and Address are Required");
        }

        const {areaStreet,city,state,pincode} = updatedData.address as any
        if (!areaStreet || !city || !state || !pincode) {
            console.log(areaStreet,city,state,pincode,"details")
            throw new Error("Address fields are incomplete.");
        }
        return this.repository.updateUser(id,updatedData)
    }

    async changePassword(id:string,currentPassword:string,newPassword:string):Promise<string>{
        const user =  await this.repository.getUserById(id)
        if(!user){
            throw new Error("User not found")
        }

        const isPasswordValid = await bcrypt.compare(currentPassword,user.password)
        if(!isPasswordValid){
            throw new Error("Current password is incorrect");
        }
        const hashedPassword = await bcrypt.hash(newPassword,10)
        await this.repository.changePassword(id,hashedPassword)

        return "Password updated Successfully"
    }

}

export default UserService;
