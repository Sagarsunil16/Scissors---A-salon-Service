    import { IUserRepostirory } from "../Interfaces/IUserRepository";
    import bcrypt from "bcryptjs";
    import { IUser } from "../Interfaces/IUser";
    import { IUserDocument } from "../models/User";
    import jwt from "jsonwebtoken";
    import { sendOtpEmail,generateOtp } from "../Utils/otp";
    import admin from "../config/firebase";
    import crypto from 'crypto'
import { userService } from "../config/di";

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
        ): Promise<{ user: IUserDocument; accessToken: string, refreshToken:string } | null> {
            const user = await  this.repository.getUserByEmail(email);
            if (!user) {
                throw new Error("Invalid email or password");
            }
            if(!user.is_Active){
                throw new Error("Account has been blocked!")
            }
            if(!user.verified){
                throw new Error("Please verify you account first")
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
            throw new Error("Invalid email or password");
            }
            console.log(user,"user")
            const accessToken = jwt.sign({ id: user._id,role:user.role,active:user.is_Active }, process.env.JWT_SECRET as string, {
            expiresIn: "15m",
            });

            const refreshToken = jwt.sign({id:user._id,role:user.role,active:user.is_Active},process.env.REFRESH_TOKEN_SECRET as string,{
                expiresIn:'7d'
            })

            await this.repository.updateUserData(user._id as string,{refreshToken})
            console.log("Done")
            return { user,accessToken,refreshToken };
        }

        async googleLogin(idToken:string,refreshToken:string):Promise<{user:IUserDocument,token:string}>{
            
            const decodedToken = await admin.auth().verifyIdToken(idToken)
            console.log(decodedToken,"gooolge")
            const {email,name} = decodedToken
            const tempPassword = crypto.randomBytes(16).toString('hex')
            if(!email){
                throw new Error ("Invalid Google Token: Email is missing");
            }
            const username = name.split(" ")
            let user =  await this.repository.getUserByEmail(email)
        
            if(user==null){
            user = await this.repository.createUser({
            firstname: username[0],
            lastname:username[1]?username[1]: " ",
            email:email,
            phone:" ",
            password:tempPassword,
            verified:true,
            refreshToken
            })
            console.log(user);
            
            }

            const token = jwt.sign({id:user._id},process.env.JWT_SECRET as string,{expiresIn: "1h"})
            
            return {user,token}
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

        async getAllUsers(page:number,limit:number):Promise<{data:IUserDocument[],totalCount:number}>{
            return await this.repository.getAllUsers(page,limit)
        }

        async verifyOTP(email:string,otp:string):Promise<string>{
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
                await this.repository.verifyOtpAndUpdate(email)
                return "Verification Successfull"
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
            updatedData: Partial<IUser>,
            isAdmin:boolean
        ): Promise<IUserDocument | null> {

            if(isAdmin){
                if(!updatedData.firstname || !updatedData.lastname || !updatedData.phone){
                    throw new Error("firstname,lastname and phone is required")
                }
            }else{
                if(!updatedData.firstname || !updatedData.lastname || !updatedData.address){
                    throw new Error("Firstname, Lastname and Address are Required");
                }
                const {areaStreet,city,state,pincode} = updatedData.address as any
                if (!areaStreet || !city || !state || !pincode) {
                    throw new Error("Address fields are incomplete.");
                }
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

        async updateUserStatus(id:string,isActive:boolean):Promise<any>{
            return await this.repository.updateUserStatus(id,isActive)
            
        }

        async updateRefreshToken(id:string,refreshToken:string):Promise<any>{
            return await this.repository.updateRefreshToken(id,refreshToken)
        }


    }

    export default UserService;
