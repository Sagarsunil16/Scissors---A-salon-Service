import { AddServiceDto, CreateSalonDto, LoginSalonDto, SalonDto, UpdateSalonDto, UpdateServiceDto } from "../../dto/salon.dto";
import { ISalonDocument } from "../../models/Salon";
import { ISalon, SalonResult } from "./ISalon";
import { SalonQueryParams } from "./ISalon";


export interface ISalonService {
  createSalon(salonData: CreateSalonDto): Promise<SalonDto>;
  findSalon(id: string): Promise<SalonDto | null>;
  findSalonRaw(id: string): Promise<ISalonDocument | null>
  sendOtp(email: string): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<string>;
  loginSalon(data:LoginSalonDto): Promise<{ salon: SalonDto; accessToken: string; refreshToken: string }>;
  signOut(refreshToken: string): Promise<void>;
  getSalonData(id: string): Promise<SalonDto | null>;
  getNearbySalons(params: SalonQueryParams): Promise<SalonResult>;
  getFilteredSalons(
    filters: { search?: string; location?: string; maxPrice?: number; ratings?: number[]; offers?: string },
    page: number,
    itemsPerPage: number
  ): Promise<{ salons: SalonDto[]; total: number; totalPages: number }>;
  salonProfileUpdate(updatedData: UpdateSalonDto): Promise<SalonDto | null>;
  updateSalonStatus(id: string, isActive: boolean): Promise<SalonDto | null>;
  getAllSalons(page: number, search: string): Promise<{ salonData: SalonDto[]; totalPages: number }>;
  allSalonListForChat(): Promise<Partial<SalonDto>[]>;
  uploadSalonImage(salonId: string, filePath: string): Promise<SalonDto | null>;
  deleteSalonImage(salonId: string, imageId: string, cloudinaryImageId: string): Promise<SalonDto | null>;
  addService(data:AddServiceDto): Promise<SalonDto | null>;
  updateService(
    data:UpdateServiceDto
  ): Promise<SalonDto | null>;
  removeService(salonId: string, serviceId: string): Promise<SalonDto | null>;
}