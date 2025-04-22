import { GeolocationApiResponse, GeolocationResult, ISalon } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { sendOtpEmail,generateOtp } from "../Utils/otp";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cloudinary from "../config/cloudinary";
import { SalonQueryParams } from "../Interfaces/Salon/ISalon";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import mongoose, { Mongoose } from "mongoose";
import { salonService } from "../config/di";
import CustomError from "../Utils/cutsomError";
import axios from "axios";
import { GEOLOCATION_API } from "../constants";

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
            throw new CustomError("Category not found. Please choose a valid category.", 400);
         }
        salonData.category = categoryData._id as mongoose.Types.ObjectId

        //Geocode address
        const address = `${salonData.address.areaStreet}, ${salonData.address.city}, ${salonData.address.state}, ${salonData.address.pincode}`
        
        try {
            const response =  await axios.get<GeolocationApiResponse>(GEOLOCATION_API,{
                params:{
                    address,
                    key:process.env.GOOGLE_MAPS_API_KEY
                }
            });
    
            if (response.data.status !== 'OK' || !response.data.results[0]){
                throw new CustomError("Failed to geocode address. Please provide a valid address",400)
            }
            
            const {lng,lat} = response.data.results[0].geometry.location
            salonData.address.location = {
                type:'Point',
                coordinates:[lng,lat]
            }
        } catch (error:any) {
            console.log(error.message,"error in the geocoding")
        }
        

        salonData.password = await bcrypt.hash(salonData.password,10)
        return await this.salonRepository.createSalon(salonData)
    }

    async findSalon(id:string):Promise<ISalonDocument | null>{
        return this.salonRepository.getSalonById(id)
    }

    async sendOtp(email:string):Promise<string>{
            const salon = await this.salonRepository.getSalonByEmail(email)
            if(!salon){
                throw new CustomError("No account found with this email address. Please check and try again.", 404);
            }
            const otp = generateOtp()
            const otpExpiry = new Date(Date.now() + 1 * 60 * 1000) // 1minutes
            await this.salonRepository.updateSalonOtp(email,otp,otpExpiry)
            await sendOtpEmail(email,otp)
            return "OTP has been sent to your email address.";
    }

    async verifyOtp(email:string,otp:string):Promise<string>{
        const salon =  await this.salonRepository.getSalonByEmail(email)
        if(!salon){
            throw new CustomError("Salon not found with this email. Please ensure your account exists.", 404);
        }
        if(!salon.otp || !salon.otpExpiry || salon.otp!==otp){
            throw new CustomError("Invalid OTP. Please check and try again.", 400);
        }
        if(salon.otpExpiry< new Date()){
            throw new CustomError("OTP has expired. Please request a new one.", 400);
        }
        await this.salonRepository.verifyOtpAndUpdate(email)
        return "Verification successful. You may now log in.";
    }

    async loginSalon(email:string,password:string):Promise<{salon:ISalonDocument,accessToken:string,refreshToken:string}>{
        const salon = await this.salonRepository.getSalonByEmail(email)
        if(!salon){
            throw new CustomError("Salon not found. Please check your email or create an account.", 404);
        }
        const isPasswordValid =  await bcrypt.compare(password,salon.password);
        if(!isPasswordValid){
            throw new CustomError("Invalid email or password. Please try again.", 400);
        }

        if(!salon.verified){
            throw new CustomError("Please verify your account before logging in.", 400);
        }

        if(!salon.is_Active){
            throw new CustomError("Your account has been deactivated. Please contact customer care.", 403);
        }

      
        const accessToken  =  jwt.sign({id:salon._id,role:salon.role,active:salon.is_Active},process.env.JWT_SECRET as string,{
            expiresIn:'15m'
        })

        const refreshToken = jwt.sign({id:salon._id,role:salon.role,active:salon.is_Active},process.env.JWT_SECRET as string,{
            expiresIn: '7d'
        })
        const updateData = {
            refreshToken:refreshToken
        }
        this.salonRepository.updateSalon(salon.id,updateData,{new:true})

        return {salon,accessToken,refreshToken}
    }

    async getSalonData(id:string):Promise<ISalonDocument | null>{
        if(!id){
            throw new CustomError("Salon ID is required to fetch salon data.", 400);
        }
        return this.salonRepository.getSalonById(id)
    }

    async getNearbySalons(latitude:number,longitude:number,radius:number):Promise<ISalonDocument[]>{
        return await this.salonRepository.getNearbySalons(longitude,latitude,radius)
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
        throw new CustomError("Missing required fields. Salon name, email, and phone are mandatory.", 400);
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

    async allSalonListForChat():Promise <Partial<ISalonDocument>[]>{
        return await this.salonRepository.allSalonListForChat()
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
        throw new CustomError("Salon not found. Please verify the salon ID.", 404);
    }
    await cloudinary.uploader.destroy(cloudinaryImageId);
    const imageExist = salon.images.some((image)=>image._id.toString() === imageId)
    if(!imageExist){
        throw new CustomError("The image you are trying to delete does not exist.", 404);
    }

    const updatedSalonData = await this.salonRepository.deleteSalonImage(salonId,imageId)
    return updatedSalonData
  }

  async addService(salonId:string,serviceData:{name:string,description:string,service:string,price:number,duration:number,stylist:{}[]}):Promise<ISalonDocument |null>{
    if(!salonId){
        throw new CustomError("Salon ID is required to add a service.", 400);
    }
    if (!serviceData.name || !serviceData.price || !serviceData.description || !serviceData.service || !serviceData.duration ) {
        throw new CustomError("All fields are required to add a service.", 400);
    }
    const result =  await this.salonRepository.addService(salonId,serviceData)

   return result
  }

  async updateService(serviceData:{salonId:string,serviceId:string,name:string,description:string,price:number,service:string,duration:number,stylists:string[]}):Promise<ISalonDocument | null>{
    // Update validation
    const requiredFields: (keyof typeof serviceData)[] = [
        'name', 
        'description', 
        'price', 
        'service', 
        'duration', 
        'stylists'
      ];
    
      // Add type predicate to filter
      const missingFields = requiredFields.filter(
        (field): field is keyof typeof serviceData => 
          !serviceData[field]
      );
      if (missingFields.length > 0) {
        throw new CustomError(`Missing fields: ${missingFields.join(', ')}`, 400);
      }

      // Validate service ID before conversion
    if (!mongoose.Types.ObjectId.isValid(serviceData.service)) {
        throw new CustomError("Invalid service ID.", 400);
    }
    

    // Convert string IDs to ObjectIds
    const data = {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        service: new mongoose.Types.ObjectId(serviceData.service),
        duration: serviceData.duration,
        stylists: serviceData.stylists.map(id => new mongoose.Types.ObjectId(id))
    };

    return this.salonRepository.updateService(
        serviceData.salonId,
        serviceData.serviceId,
        data
    );
 
    }

    async removeService(salonId:string,serviceId:string):Promise<ISalonDocument | null>{
        if(!salonId || !serviceId){
            throw new CustomError("Both Salon ID and Service ID are required to remove a service.", 400);
        }

        const salon = this.salonRepository.getSalonById(salonId)
        if(!salon){
            throw new CustomError("Salon not found. Please verify the salon ID.", 404);
        }
        return this.salonRepository.removeService(salonId,serviceId)
    }
}

export default SalonService