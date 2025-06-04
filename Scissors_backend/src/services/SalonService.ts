import { GeolocationApiResponse, GeolocationResult, ISalon, SalonQueryParamsForUser, SalonResult } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { sendOtpEmail,generateOtp } from "../Utils/otp";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cloudinary from "../config/cloudinary";
import { SalonQueryParams } from "../Interfaces/Salon/ISalon";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import mongoose from "mongoose";
import CustomError from "../Utils/cutsomError";
import axios from "axios";
import { GEOLOCATION_API } from "../constants";
import { TokenPayload } from "../Interfaces/Auth/IAuthService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import Offer from "../models/Offer";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

class SalonService implements ISalonService {
  private _salonRepository: ISalonRepository;
  private _categoryRepository: ICategoryRepository;

  constructor(salonRepository: ISalonRepository, categoryRepository: ICategoryRepository) {
    this._salonRepository = salonRepository;
    this._categoryRepository = categoryRepository;
  }

  async createSalon(salonData: ISalon): Promise<ISalonDocument> {
    const categoryData = await this._categoryRepository.findByName(salonData.category);
    if (!categoryData) {
      throw new CustomError("Category not found. Please choose a valid category.", 400);
    }
    salonData.category = categoryData._id as mongoose.Types.ObjectId;

    const address = `${salonData.address.areaStreet}, ${salonData.address.city}, ${salonData.address.state}, ${salonData.address.pincode}`;

    try {
      const response = await axios.get<GeolocationApiResponse>(GEOLOCATION_API, {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.status !== 'OK' || !response.data.results[0]) {
        throw new CustomError("Failed to geocode address. Please provide a valid address", 400);
      }

      const { lng, lat } = response.data.results[0].geometry.location;
      salonData.address.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    } catch (error: any) {
      console.log(error.message, "error in the geocoding");
    }

    salonData.password = await bcrypt.hash(salonData.password, 10);
    return await this._salonRepository.createSalon(salonData);
  }

  async findSalon(id: string): Promise<ISalonDocument | null> {
    return this._salonRepository.getSalonById(id);
  }

  async sendOtp(email: string): Promise<string> {
    const salon = await this._salonRepository.getSalonByEmail(email);
    if (!salon) {
      throw new CustomError("No account found with this email address. Please check and try again.", 404);
    }
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
    await this._salonRepository.updateSalonOtp(email, otp, otpExpiry);
    await sendOtpEmail(email, otp);
    return "OTP has been sent to your email address.";
  }

  async verifyOtp(email: string, otp: string): Promise<string> {
    const salon = await this._salonRepository.getSalonByEmail(email);
    if (!salon) {
      throw new CustomError("Salon not found with this email. Please ensure your account exists.", 404);
    }
    if (!salon.otp || !salon.otpExpiry || salon.otp !== otp) {
      throw new CustomError("Invalid OTP. Please check and try again.", 400);
    }
    if (salon.otpExpiry < new Date()) {
      throw new CustomError("OTP has expired. Please request a new one.", 400);
    }
    await this._salonRepository.verifyOtpAndUpdate(email);
    return "Verification successful. You may now log in.";
  }

  async loginSalon(email: string, password: string): Promise<{ salon: ISalonDocument; accessToken: string; refreshToken: string }> {
    const salon = await this._salonRepository.getSalonByEmail(email);
    if (!salon) {
      throw new CustomError("Salon not found. Please check your email or create an account.", 404);
    }
    const isPasswordValid = await bcrypt.compare(password, salon.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid email or password. Please try again.", 400);
    }

    if (!salon.verified) {
      throw new CustomError("Please verify your account before logging in.", 400);
    }

    if (!salon.is_Active) {
      throw new CustomError("Your account has been deactivated. Please contact customer care.", 403);
    }

    const accessToken = jwt.sign(
      { id: salon._id, role: salon.role, active: salon.is_Active },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: salon._id, role: salon.role, active: salon.is_Active },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );
    const updateData = {
      refreshToken: refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    await this._salonRepository.updateSalon(salon._id.toString(), updateData, { new: true });

    return { salon, accessToken, refreshToken };
  }

  async signOut(refreshToken: string) {
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as TokenPayload;
        if (decoded.role == 'Salon') {
          const salon = await this._salonRepository.getSalonById(decoded.id);
          if (salon) {
            await this._salonRepository.updateSalon(salon._id.toString(), { refreshToken: null, refreshTokenExpiresAt: null });
          }
        }
      } catch (error) {
        console.warn('Invalid refresh token during sign-out:', error);
      }
    }
  }

  async getSalonData(id: string): Promise<ISalonDocument | null> {
    if (!id) {
      throw new CustomError("Salon ID is required to fetch salon data.", 400);
    }
    return this._salonRepository.getSalonById(id);
  }

  async getNearbySalons(params: SalonQueryParamsForUser): Promise<SalonResult> {
    const { longitude, latitude, radius, search, maxPrice, ratings, discount, page, limit } = params;
    const skip = (page - 1) * limit;
    if (longitude !== undefined && latitude !== undefined) {
      if (isNaN(longitude) || isNaN(latitude)) {
        throw new CustomError('Invalid longitude or latitude.', 400);
      }
    }

    let query: any = {};
    if (search) {
      query.$or = [
        { salonName: { $regex: search, $options: 'i' } },
        { 'services.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (maxPrice < 100000) {
      query['services.price'] = { $lte: maxPrice };
    }
    if (ratings.length > 0) {
      query.rating = { $in: ratings };
    }

    if (discount > 0) {
      const offerSalonIds = await Offer.find({
        discount: { $gte: discount },
        isActive: true,
        expiryDate: { $gte: new Date() },
      }).distinct('salonId');
      query._id = { $in: offerSalonIds };
    }

    let salons: ISalonDocument[] = [];
    let totalSalons = 0;
    if (longitude !== undefined && latitude !== undefined) {
      salons = await this._salonRepository.getNearbySalons(longitude, latitude, radius, query, skip, limit);
      totalSalons = await this._salonRepository.countNearbySalons(longitude, latitude, radius, query);
    } else {
      salons = await this._salonRepository.getAllSalons(query, skip, limit);
      totalSalons = await this._salonRepository.countAllSalons(query);
    }

    return {
      salons,
      totalSalons,
      totalPages: Math.ceil(totalSalons / limit),
    };
  }

  async getFilteredSalons(
    filters: { search?: string; location?: string; maxPrice?: number; ratings?: number[]; offers?: string },
    page: number,
    itemsPerPage: number
  ): Promise<{ salons: ISalonDocument[]; total: number; totalPages: number }> {
    const { salons, total } = await this._salonRepository.findAllSalons(
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

  async salonProfileUpdate(updatedData: Partial<ISalon>): Promise<ISalonDocument | null> {
    if (!updatedData.salonName || !updatedData.email || !updatedData.phone) {
      throw new CustomError("Missing required fields. Salon name, email, and phone are mandatory.", 400);
    }
    const updatedSalon = await this._salonRepository.updateSalonProfile(updatedData);
    return updatedSalon;
  }

  async updateSalonStatus(id: string, isActive: boolean): Promise<ISalonDocument | null> {
    return await this._salonRepository.updateSalonStatus(id, isActive);
  }

  async getAllSalons(page: number, search: string): Promise<{ salonData: ISalonDocument[]; totalPages: number }> {
    if (isNaN(page) || page < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }

    const query: any = {};
    if (search) {
      query.$or = [
        { salonName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const { data: salons, totalCount } = await this._salonRepository.getAllSalon(page, query);
    const totalPages = Math.ceil(totalCount / 10);

    return { salonData: salons, totalPages };
  }

  async allSalonListForChat(): Promise<Partial<ISalonDocument>[]> {
    return await this._salonRepository.allSalonListForChat();
  }

  async uploadSalonImage(salonId: string, filePath: string): Promise<ISalonDocument | null> {
    try {
      const { public_id, secure_url } = await cloudinary.uploader.upload(filePath, {
        folder: "salon_gallery"
      });
      const imageData = { id: public_id, url: secure_url };
      const updatedSalonData = await this._salonRepository.addImagesToSalon(salonId, imageData);
      return updatedSalonData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteSalonImage(salonId: string, imageId: string, cloudinaryImageId: string): Promise<ISalonDocument | null> {
    const salon = await this._salonRepository.getSalonById(salonId);
    if (!salon) {
      throw new CustomError("Salon not found. Please verify the salon ID.", 404);
    }
    await cloudinary.uploader.destroy(cloudinaryImageId);
    const imageExist = salon.images.some((image) => image._id.toString() === imageId);
    if (!imageExist) {
      throw new CustomError("The image you are trying to delete does not exist.", 404);
    }

    const updatedSalonData = await this._salonRepository.deleteSalonImage(salonId, imageId);
    return updatedSalonData;
  }

  async addService(
    salonId: string,
    serviceData: { name: string; description: string; service: string; price: number; duration: number; stylist: {}[] }
  ): Promise<ISalonDocument | null> {
    if (!salonId) {
      throw new CustomError("Salon ID is required to add a service.", 400);
    }
    if (!serviceData.name || !serviceData.price || !serviceData.description || !serviceData.service || !serviceData.duration) {
      throw new CustomError("All fields are required to add a service.", 400);
    }
    const result = await this._salonRepository.addService(salonId, serviceData);
    return result;
  }

  async updateService(
    serviceData: {
      salonId: string;
      serviceId: string;
      name: string;
      description: string;
      price: number;
      service: string;
      duration: number;
      stylists: string[];
    }
  ): Promise<ISalonDocument | null> {
    const requiredFields: (keyof typeof serviceData)[] = [
      'name',
      'description',
      'price',
      'service',
      'duration',
      'stylists'
    ];

    const missingFields = requiredFields.filter(
      (field): field is keyof typeof serviceData =>
        !serviceData[field]
    );
    if (missingFields.length > 0) {
      throw new CustomError(`Missing fields: ${missingFields.join(', ')}`, 400);
    }

    if (!mongoose.Types.ObjectId.isValid(serviceData.service)) {
      throw new CustomError("Invalid service ID.", 400);
    }

    const data = {
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      service: new mongoose.Types.ObjectId(serviceData.service),
      duration: serviceData.duration,
      stylists: serviceData.stylists.map(id => new mongoose.Types.ObjectId(id))
    };

    return this._salonRepository.updateService(
      serviceData.salonId,
      serviceData.serviceId,
      data
    );
  }

  async removeService(salonId: string, serviceId: string): Promise<ISalonDocument | null> {
    if (!salonId || !serviceId) {
      throw new CustomError("Both Salon ID and Service ID are required to remove a service.", 400);
    }

    const salon = await this._salonRepository.getSalonById(salonId);
    if (!salon) {
      throw new CustomError("Salon not found. Please verify the salon ID.", 404);
    }
    return this._salonRepository.removeService(salonId, serviceId);
  }
}

export default SalonService