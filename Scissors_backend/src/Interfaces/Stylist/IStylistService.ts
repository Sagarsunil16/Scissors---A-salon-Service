import { IStylist, IStylistDocument, PaginationOptions } from "./IStylist";

export interface IStylistService {
  createStylist(stylistData: IStylist): Promise<IStylistDocument>;
  findStylist(salonId: string, options: PaginationOptions, searchTerm?: string): Promise<{ stylists: IStylistDocument[]; totalCount: number }>;
  updateStylist(id: string, updateData: Partial<IStylist>): Promise<IStylistDocument | null>;
  findStylistById(id: string): Promise<IStylistDocument | null>;
  deleteStylist(id: string): Promise<boolean>;
}