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
import { AddServiceDto, CreateSalonDto, LoginSalonDto, SalonDto, UpdateSalonDto, UpdateServiceDto } from "../dto/salon.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Update } from "vite";

class SalonService implements ISalonService {
  private _salonRepository: ISalonRepository;
  private _categoryRepository: ICategoryRepository;

  constructor(salonRepository: ISalonRepository, categoryRepository: ICategoryRepository) {
    this._salonRepository = salonRepository;
    this._categoryRepository = categoryRepository;
  }

  async createSalon(salonData: CreateSalonDto): Promise<SalonDto> {
    console.log(salonData)
    const createSalonDto = plainToClass(CreateSalonDto, salonData);
    const errors = await validate(createSalonDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_SALON_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }
    const existingSalon = await this._salonRepository.getSalonByEmail(createSalonDto.email);
    if (existingSalon) {
      throw new CustomError("Salon Already Exists", HttpStatus.CONFLICT);
    }
    const categoryData = await this._categoryRepository.findByName(salonData.category);
    if (!categoryData) {
      throw new CustomError("Category not found. Please choose a valid category.", 400);
    }
    salonData.category = categoryData._id as string;

    const address = `${salonData.address.areaStreet}, ${salonData.address.city}, ${salonData.address.state}, ${salonData.address.pincode}`;
    let location: { type: "Point"; coordinates: [number, number]; } | undefined;
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
      location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    } catch (error: any) {
      console.log(error.message, "error in the geocoding");
    }

    const hashedPassword = await bcrypt.hash(createSalonDto.password, 10);
    let salon = await this._salonRepository.createSalon({
      salonName: createSalonDto.salonName,
      email: createSalonDto.email,
      phone: Number(createSalonDto.phone),
      password: hashedPassword,
      address: { ...createSalonDto.address, location },
      category: categoryData._id as string,
    });
     salon = salon.toObject()
    return plainToClass(SalonDto, {
      _id: salon._id.toString(),
      salonName: salon.salonName,
      email: salon.email,
      phone: salon.phone,
      address: salon.address,
      category: salon.category.toString(),
      openingTime: salon.openingTime,
      closingTime: salon.closingTime,
      rating: salon.rating,
      reviewCount: salon.reviewCount,
      images: salon.images,
      services: salon.services,
      verified: salon.verified,
      is_Active: salon.is_Active,
      role:salon.role
    });
  }
  async findSalonRaw(id: string): Promise<ISalonDocument | null> {
      return this._salonRepository.findSalonRaw(id)
  }
  async findSalon(id: string): Promise<SalonDto | null> {
   const salon = await this._salonRepository.getSalonById(id);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return plainToClass(SalonDto, {
      _id: salon._id.toString(),
      salonName: salon.salonName,
      email: salon.email,
      phone: salon.phone,
      address: salon.address,
      category: salon.category.toString(),
      openingTime: salon.openingTime,
      closingTime: salon.closingTime,
      rating: salon.rating,
      reviewCount: salon.reviewCount,
      images: salon.images,
      services: salon.services,
      verified: salon.verified,
      is_Active: salon.is_Active,
      role:salon.role
    });
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

  async loginSalon(data:LoginSalonDto): Promise<{ salon: SalonDto; accessToken: string; refreshToken: string }> {
    const loginSalonDto = plainToClass(LoginSalonDto, data);
    const errors = await validate(loginSalonDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_CREDENTIALS + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }
    const salon = await this._salonRepository.getSalonByEmail(loginSalonDto.email);
    if (!salon) {
      throw new CustomError("Salon not found. Please check your email or create an account.", 404);
    }
    const isPasswordValid = await bcrypt.compare(loginSalonDto.password, salon.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid email or password. Please try again.", 400);
    }

    if (!salon.verified) {
      throw new CustomError("Please verify your account before logging in.", 400);
    }

    if (!salon.is_Active) {
      throw new CustomError("Your account has been deactivated. Please contact customer care.", 403);
    }

    console.log(salon,"salon in login")
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

    return {
      salon: plainToClass(SalonDto, {
        _id: salon._id.toString(),
        salonName: salon.salonName,
        email: salon.email,
        phone: salon.phone,
        address: salon.address,
        category: salon.category.toString(),
        openingTime: salon.openingTime,
        closingTime: salon.closingTime,
        rating: salon.rating,
        reviewCount: salon.reviewCount,
        images: salon.images,
        services: salon.services,
        verified: salon.verified,
        is_Active: salon.is_Active,
        role:salon.role
      }),
      accessToken,
      refreshToken,
    };
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

  async getSalonData(id: string): Promise<SalonDto | null> {
    if (!id) {
      throw new CustomError("Salon ID is required to fetch salon data.", 400);
    }
    const salon = await this._salonRepository.getSalonById(id);
    console.log("salon data in repo" ,salon)
    return plainToClass(SalonDto,{
        _id: salon?._id.toString(),
        salonName: salon?.salonName,
        email: salon?.email,
        phone: salon?.phone,
        address: salon?.address,
        category: salon?.category.toString(),
        openingTime: salon?.openingTime,
        closingTime: salon?.closingTime,
        rating: salon?.rating,
        reviewCount: salon?.reviewCount,
        images: salon?.images,
        services: salon?.services,
        verified: salon?.verified,
        is_Active: salon?.is_Active,
        timeZone:salon?.timeZone,
        role:salon?.role

    })
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
    console.log(salons,"salonss")

    return {
      salons: salons.map((salon) =>
        plainToClass(SalonDto, {
          _id: salon._id.toString(),
          salonName: salon.salonName,
          email: salon.email,
          phone: salon.phone,
          address: salon.address,
          category: salon.category?.toString?.() || null,
          openingTime: salon.openingTime,
          closingTime: salon.closingTime,
          rating: salon.rating,
          reviewCount: salon.reviewCount,
          images: salon.images,
          services: salon.services,
          verified: salon.verified,
          is_Active: salon.is_Active,
          timeZone:salon.timeZone,
          role:salon.role
        })
      ),
      totalSalons,
      totalPages: Math.ceil(totalSalons / limit),
    };
  }

  async getFilteredSalons(
    filters: { search?: string; location?: string; maxPrice?: number; ratings?: number[]; offers?: string },
    page: number,
    itemsPerPage: number
  ): Promise<{ salons: SalonDto[]; total: number; totalPages: number }> {
    const { salons, total } = await this._salonRepository.findAllSalons(
      filters,
      page,
      itemsPerPage
    );
    const totalPages = Math.ceil(total / itemsPerPage);
    return {
      salons: salons.map((salon) =>
        plainToClass(SalonDto, {
          _id: salon._id.toString(),
          salonName: salon.salonName,
          email: salon.email,
          phone: salon.phone,
          address: salon.address,
          category: salon.category.toString(),
          openingTime: salon.openingTime,
          closingTime: salon.closingTime,
          rating: salon.rating,
          reviewCount: salon.reviewCount,
          images: salon.images,
          services: salon.services,
          verified: salon.verified,
          is_Active: salon.is_Active,
          timeZone:salon?.timeZone,
          role:salon.role
        })
      ),
      total,
      totalPages
    };
  }

  async salonProfileUpdate(updatedData: UpdateSalonDto): Promise<SalonDto | null> {
    const updateSalonDto = plainToClass(UpdateSalonDto, updatedData);
    const errors = await validate(updateSalonDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_SALON_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }

    const salon = await this._salonRepository.getSalonById(updateSalonDto.id);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const address = `${updateSalonDto.address.areaStreet}, ${updateSalonDto.address.city}, ${updateSalonDto.address.state}, ${updateSalonDto.address.pincode}`;
    let location: { type: "Point"; coordinates: [number, number]; } | undefined
    try {
      const response = await axios.get<GeolocationApiResponse>(GEOLOCATION_API, {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.status !== 'OK' || !response.data.results[0]) {
        throw new CustomError(Messages.INVALID_ADDRESS, HttpStatus.BAD_REQUEST);
      }

      const { lng, lat } = response.data.results[0].geometry.location;
      location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    } catch (error) {
      throw new CustomError(Messages.GEOCODING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const updatedSalon = await this._salonRepository.updateSalonProfile({
      salonName: updateSalonDto.salonName,
      email: updateSalonDto.email,
      phone: updateSalonDto.phone,
      address: { ...updateSalonDto.address, location},
      openingTime: updateSalonDto.openingTime,
      closingTime: updateSalonDto.closingTime,
      timeZone: updateSalonDto.timeZone,
    });

    if (!updatedSalon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return plainToClass(SalonDto, {
      _id: updatedSalon._id.toString(),
      salonName: updatedSalon.salonName,
      email: updatedSalon.email,
      phone: updatedSalon.phone,
      address: updatedSalon.address,
      category: updatedSalon.category.toString(),
      openingTime: updatedSalon.openingTime,
      closingTime: updatedSalon.closingTime,
      rating: updatedSalon.rating,
      reviewCount: updatedSalon.reviewCount,
      images: updatedSalon.images,
      services: updatedSalon.services,
      verified: updatedSalon.verified,
      is_Active: updatedSalon.is_Active,
      timeZone:updatedSalon?.timeZone,
      role:updatedSalon?.role
    });
  }

  async updateSalonStatus(id: string, isActive: boolean): Promise<SalonDto | null> {
   const updatedSalon = await this._salonRepository.updateSalonStatus(id, isActive);
    if (!updatedSalon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return plainToClass(SalonDto, {
      _id: updatedSalon._id.toString(),
      salonName: updatedSalon.salonName,
      email: updatedSalon.email,
      phone: updatedSalon.phone,
      address: updatedSalon.address,
      category: updatedSalon.category.toString(),
      openingTime: updatedSalon.openingTime,
      closingTime: updatedSalon.closingTime,
      rating: updatedSalon.rating,
      reviewCount: updatedSalon.reviewCount,
      images: updatedSalon.images,
      services: updatedSalon.services,
      verified: updatedSalon.verified,
      is_Active: updatedSalon.is_Active,
      timeZone:updatedSalon?.timeZone,
      role:updatedSalon?.role
    });
  }

  async getAllSalons(page: number, search: string): Promise<{ salonData: SalonDto[]; totalPages: number }> {
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

    let { data: salons, totalCount } = await this._salonRepository.getAllSalon(page, query);
    const totalPages = Math.ceil(totalCount / 10);

   salons = salons.map((salon: any) => salon.toObject());

    return { salonData: salons.map((salon) =>
        plainToClass(SalonDto, {
          _id: salon._id.toString(),
          salonName: salon.salonName,
          email: salon.email,
          phone: salon.phone,
          address: salon.address,
          category: salon.category?.toString() ?? "",
          openingTime: salon.openingTime,
          closingTime: salon.closingTime,
          rating: salon.rating,
          reviewCount: salon.reviewCount,
          images: salon.images,
          services: salon.services,
          verified: salon.verified,
          is_Active: salon.is_Active,
          timeZone:salon?.timeZone,
          role:salon.role
        })
      ), totalPages };
  }

  async allSalonListForChat(): Promise<Partial<SalonDto>[]> {
    const salons = await this._salonRepository.allSalonListForChat();
    return salons.map((salon) =>
      plainToClass(SalonDto, {
        _id: salon._id?.toString(),
        salonName: salon.salonName,
        email: salon.email,
        images: salon.images,
      })
    );
  }

  async uploadSalonImage(salonId: string, filePath: string): Promise<SalonDto | null> {
    const salon = await this._salonRepository.getSalonById(salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    try {
      const { public_id, secure_url } = await cloudinary.uploader.upload(filePath, {
        folder: "salon_gallery"
      });
      const imageData = { id: public_id, url: secure_url };
      const updatedSalon = await this._salonRepository.addImagesToSalon(salonId, imageData);
      if (!updatedSalon) {
        throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      return plainToClass(SalonDto, {
        _id: updatedSalon._id.toString(),
        salonName: updatedSalon.salonName,
        email: updatedSalon.email,
        phone: updatedSalon.phone,
        address: updatedSalon.address,
        category: updatedSalon.category.toString(),
        openingTime: updatedSalon.openingTime,
        closingTime: updatedSalon.closingTime,
        rating: updatedSalon.rating,
        reviewCount: updatedSalon.reviewCount,
        images: updatedSalon.images,
        services: updatedSalon.services,
        verified: updatedSalon.verified,
        is_Active: updatedSalon.is_Active,
        timeZone:updatedSalon?.timeZone,
        role:updatedSalon.role
      });;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteSalonImage(salonId: string, imageId: string, cloudinaryImageId: string): Promise<SalonDto | null> {
    const salon = await this._salonRepository.getSalonById(salonId);
    if (!salon) {
      throw new CustomError("Salon not found. Please verify the salon ID.", 404);
    }
    const imageExists = salon.images.some((image) => image._id.toString() === imageId);
    if (!imageExists) {
      throw new CustomError(Messages.IMAGE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
   try {
      await cloudinary.uploader.destroy(cloudinaryImageId);
      const updatedSalon = await this._salonRepository.deleteSalonImage(salonId, imageId);

      if (!updatedSalon) {
        throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      return plainToClass(SalonDto, {
        _id: updatedSalon._id.toString(),
        salonName: updatedSalon.salonName,
        email: updatedSalon.email,
        phone: updatedSalon.phone,
        address: updatedSalon.address,
        category: updatedSalon.category.toString(),
        openingTime: updatedSalon.openingTime,
        closingTime: updatedSalon.closingTime,
        rating: updatedSalon.rating,
        reviewCount: updatedSalon.reviewCount,
        images: updatedSalon.images,
        services: updatedSalon.services,
        verified: updatedSalon.verified,
        is_Active: updatedSalon.is_Active,
        timeZone:updatedSalon?.timeZone,
        role:updatedSalon?.role
      });
    } catch (error) {
      throw new CustomError(Messages.IMAGE_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addService(
   data:AddServiceDto
  ): Promise<SalonDto | null> {
    const addServiceDto = plainToClass(AddServiceDto, data);
    const errors = await validate(addServiceDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }

    console.log("we entered here")
    const salon = await this._salonRepository.getSalonById(addServiceDto.salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const updatedSalon = await this._salonRepository.addService(addServiceDto.salonId, {
      name: addServiceDto.name,
      description: addServiceDto.description,
      service: addServiceDto.service,
      price: addServiceDto.price,
      duration: addServiceDto.duration,
      stylists: addServiceDto.stylists,
    });

    if (!updatedSalon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return plainToClass(SalonDto, {
      _id: updatedSalon._id.toString(),
      salonName: updatedSalon.salonName,
      email: updatedSalon.email,
      phone: updatedSalon.phone,
      address: updatedSalon.address,
      category: updatedSalon.category.toString(),
      openingTime: updatedSalon.openingTime,
      closingTime: updatedSalon.closingTime,
      rating: updatedSalon.rating,
      reviewCount: updatedSalon.reviewCount,
      images: updatedSalon.images,
      services: updatedSalon.services,
      verified: updatedSalon.verified,
      is_Active: updatedSalon.is_Active,
      timeZone:updatedSalon?.timeZone,
      role:updatedSalon?.role
    });
  }

  async updateService(
    data: UpdateServiceDto
  ): Promise<SalonDto | null> {

    const updateServiceDto = plainToClass(UpdateServiceDto, data);
    const errors = await validate(updateServiceDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }

   const salon = await this._salonRepository.getSalonById(updateServiceDto.salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const serviceExists = salon.services.some((s) => s._id.toString() === updateServiceDto.serviceId);
    if (!serviceExists) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updatedSalon = await this._salonRepository.updateService(updateServiceDto.salonId, updateServiceDto.serviceId, {
      name: updateServiceDto.name,
      description: updateServiceDto.description,
      service: new mongoose.Types.ObjectId(updateServiceDto.service),
      price: updateServiceDto.price,
      duration: updateServiceDto.duration,
      stylists: updateServiceDto.stylists.map((id) => new mongoose.Types.ObjectId(id)),
    });

    if (!updatedSalon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return plainToClass(SalonDto, {
      _id: updatedSalon._id.toString(),
      salonName: updatedSalon.salonName,
      email: updatedSalon.email,
      phone: updatedSalon.phone,
      address: updatedSalon.address,
      category: updatedSalon.category.toString(),
      openingTime: updatedSalon.openingTime,
      closingTime: updatedSalon.closingTime,
      rating: updatedSalon.rating,
      reviewCount: updatedSalon.reviewCount,
      images: updatedSalon.images,
      services: updatedSalon.services,
      verified: updatedSalon.verified,
      is_Active: updatedSalon.is_Active,
      timeZone:updatedSalon?.timeZone,
      role:updatedSalon?.role

    })
  }

  async removeService(salonId: string, serviceId: string): Promise<SalonDto | null> {
    if (!salonId || !serviceId) {
      throw new CustomError("Both Salon ID and Service ID are required to remove a service.", 400);
    }

    const salon = await this._salonRepository.getSalonById(salonId);
    if (!salon) {
      throw new CustomError("Salon not found. Please verify the salon ID.", 404);
    }

    const serviceExists = salon.services.some((s) => s._id.toString());
    if (!serviceExists) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const updatedSalon = await this._salonRepository.removeService(salonId, serviceId);
    if (!updatedSalon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return plainToClass(SalonDto, {
      _id: updatedSalon._id.toString(),
      salonName: updatedSalon.salonName,
      email: updatedSalon.email,
      phone: updatedSalon.phone,
      address: updatedSalon.address,
      category: updatedSalon.category.toString(),
      openingTime: updatedSalon.openingTime,
      closingTime: updatedSalon.closingTime,
      rating: updatedSalon.rating,
      reviewCount: updatedSalon.reviewCount,
      images: updatedSalon.images,
      services: updatedSalon.services,
      verified: updatedSalon.verified,
      is_Active: updatedSalon.is_Active,
      timeZone:updatedSalon?.timeZone,
      role:updatedSalon?.role
    });
  }
}

export default SalonService