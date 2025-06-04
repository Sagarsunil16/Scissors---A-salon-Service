import { ISalonDocument } from "../../models/Salon";
import { ISalon, SalonResult } from "./ISalon";
import { SalonQueryParams } from "./ISalon";


export interface ISalonService {
  createSalon(salonData: ISalon): Promise<ISalonDocument>;
  findSalon(id: string): Promise<ISalonDocument | null>;
  sendOtp(email: string): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<string>;
  loginSalon(email: string, password: string): Promise<{ salon: ISalonDocument; accessToken: string; refreshToken: string }>;
  signOut(refreshToken: string): Promise<void>;
  getSalonData(id: string): Promise<ISalonDocument | null>;
  getNearbySalons(params: SalonQueryParams): Promise<SalonResult>;
  getFilteredSalons(
    filters: { search?: string; location?: string; maxPrice?: number; ratings?: number[]; offers?: string },
    page: number,
    itemsPerPage: number
  ): Promise<{ salons: ISalonDocument[]; total: number; totalPages: number }>;
  salonProfileUpdate(updatedData: Partial<ISalon>): Promise<ISalonDocument | null>;
  updateSalonStatus(id: string, isActive: boolean): Promise<ISalonDocument | null>;
  getAllSalons(page: number, search: string): Promise<{ salonData: ISalonDocument[]; totalPages: number }>;
  allSalonListForChat(): Promise<Partial<ISalonDocument>[]>;
  uploadSalonImage(salonId: string, filePath: string): Promise<ISalonDocument | null>;
  deleteSalonImage(salonId: string, imageId: string, cloudinaryImageId: string): Promise<ISalonDocument | null>;
  addService(
    salonId: string,
    serviceData: { name: string; description: string; service: string; price: number; duration: number; stylist: {}[] }
  ): Promise<ISalonDocument | null>;
  updateService(
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
  ): Promise<ISalonDocument | null>;
  removeService(salonId: string, serviceId: string): Promise<ISalonDocument | null>;
}