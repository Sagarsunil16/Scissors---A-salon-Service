import { ISalon } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { sendOtpEmail,generateOtp } from "../Utils/otp";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cloudinary from "../config/cloudinary";
import { SalonQueryParams } from "../Interfaces/Salon/ISalon";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import mongoose, { Mongoose } from "mongoose";

class SalonService {
    private salonRepository: ISalonRepository;
    private categoryRepository: ICategoryRepository;
    constructor(salonRepository:ISalonRepository,categoryRepository:ICategoryRepository){
        this.salonRepository = salonRepository
        this.categoryRepository = categoryRepository
    }
    async createSalon(salonData:ISalon):Promise<ISalonDocument>{
        const categoryData =  await this.categoryRepository.findByName(salonData.category)
        if(!categoryData){
            throw new Error ("Category not Found")
         }
        salonData.category = categoryData._id as mongoose.Types.ObjectId
        salonData.password = await bcrypt.hash(salonData.password,10)
        return await this.salonRepository.createSalon(salonData)
    }

    async sendOtp(email:string):Promise<string>{
            const salon = await this.salonRepository.getSalonByEmail(email)
            if(!salon){
                throw new Error("User not found");
            }
            const otp = generateOtp()
            const otpExpiry = new Date(Date.now() + 1 * 60 * 1000) // 1minutes
            await this.salonRepository.updateSalonOtp(email,otp,otpExpiry)
            await sendOtpEmail(email,otp)
            return "OTP Sent to your email."
    }

    async verifyOtp(email:string,otp:string):Promise<string>{
        const salon =  await this.salonRepository.getSalonByEmail(email)
        if(!salon){
            throw new Error("Salon not Found")
        }
        if(!salon.otp || !salon.otpExpiry || salon.otp!==otp){
            throw new Error("Invalid or Exired Otp")
        }
        if(salon.otpExpiry< new Date()){
            throw new Error("OTP has Expired")
        }
        await this.salonRepository.verifyOtpAndUpdate(email)
        return "Verifcation Successfull"
    }

    async loginSalon(email:string,password:string):Promise<{salon:ISalonDocument,token:string}>{
        const salon = await this.salonRepository.getSalonByEmail(email)
        if(!salon){
            throw new Error ("Salon not found")
        }
        const isPasswordValid =  await bcrypt.compare(password,salon.password);
        if(!isPasswordValid){
            throw new Error ("Invalid Email or Password");
        }

        if(!salon.verified){
            throw new Error("Please veerify your account First!")
        }

        if(!salon.is_Active){
            throw new Error("Your Account has been blocked. Please contact customer care!")
        }

      
        const token  =  jwt.sign({id:salon._id},process.env.JWT_SECRET as string,{
            expiresIn:'1h'
        })

        return {salon,token}
    }

    async getSalonData(id:string):Promise<ISalonDocument | null>{
        if(!id){
            throw new Error("Id not Found")
        }
        return this.salonRepository.getSalonById(id)
    }

    async getFilteredSalons(filters:{search?: string;
            location?: string;
            maxPrice?: number;
            ratings?: number[];
            offers?: string;
          },
          page: number,
          itemsPerPage: number):Promise<{salons:ISalonDocument[],total:number,totalPages:number}>{
            const { salons, total } = await this.salonRepository.findAllSalons(
            filters,
            page,
            itemsPerPage
          );
          const totalPages = Math.ceil(total / itemsPerPage);
          return {
            salons,
            total,
            totalPages
          };
        
    }

    async salonProfileUpdate(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>{
       if(!updatedData.salonName || !updatedData.email || !updatedData.phone){
        throw new Error("Missing required fields")
       }
       const updatedSalon =  await this.salonRepository.updateSalonProfile(updatedData)
       return updatedSalon
    }

    async updateSalonStatus(id:string,isActive:boolean):Promise<ISalonDocument | null>{
      return await this.salonRepository.updateSalonStatus(id,isActive)
    }

    async getAllSalons(page:number):Promise<{data:ISalonDocument[],totalCount:number}>{
        return await this.salonRepository.getAllSalon(page)
    }

  async uploadSalonImage(salonId:string,filePath:string):Promise<ISalonDocument | null>{
    const{public_id,secure_url} =  await cloudinary.uploader.upload(filePath,{
        folder:"salon_gallery"
    })
    const imageData = {id:public_id,url:secure_url};
    const updatedSalonData =  this.salonRepository.addImagesToSalon(salonId,imageData)
    return updatedSalonData
  }

  async deleteSalonImage(salonId:string,imageId:string,cloudinaryImageId:string):Promise<ISalonDocument | null>{
    const salon = await this.salonRepository.getSalonById(salonId)
    if(!salon){
        throw new Error("Salon not found")
    }
    await cloudinary.uploader.destroy(cloudinaryImageId);
    const imageExist = salon.images.some((image)=>image._id.toString() === imageId)
    if(!imageExist){
        throw new Error("Image doesn't exist")
    }

    const updatedSalonData = await this.salonRepository.deleteSalonImage(salonId,imageId)
    return updatedSalonData
  }

  async addService(salonId:string,serviceData:{name:string,description:string,service:string,price:number}):Promise<ISalonDocument |null>{
    if(!salonId){
        throw new Error("Id not found")
    }
    if (!serviceData.name || !serviceData.price || !serviceData.description || !serviceData.service) {
        throw new Error("All Fields required");
    }
    const result =  await this.salonRepository.addService(salonId,serviceData)

   return result
  }

  async updateService(serviceData:{salonId:string,serviceId:string,name:string,description:string,price:number,service:string}):Promise<ISalonDocument | null>{
    if(!serviceData.salonId){
        throw new Error("No Id found")
    }
    if(!serviceData.name ||  !serviceData.description || !serviceData.price || !serviceData.service){
        throw new Error("Name, Description, Service and price is needed")
    }
    const salonId = serviceData.salonId
    const serviceId =  serviceData.serviceId
    const data = {name:serviceData.name,description:serviceData.description,price:serviceData.price,service:serviceData.service,}
    return this.salonRepository.updateService(salonId,serviceId,data)
  }
 
}

export default SalonService