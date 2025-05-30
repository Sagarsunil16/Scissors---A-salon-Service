import { BaseRepository } from "./BaseRepository";
import Stylist from "../models/Stylist";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";
import { IStylist, IStylistDocument, PaginationOptions } from "../Interfaces/Stylist/IStylist";

class StylistRepository extends BaseRepository<IStylistDocument> implements IStylistRepository {
  constructor() {
    super(Stylist);
  }
  async createStylist(stylistData: IStylist): Promise<IStylistDocument> {
    return await this.create(stylistData);
  }

  async findStylistById(id: string): Promise<IStylistDocument | null> {
    return await this.model.findById(id).exec()
  }

  async findStylists(
    salonId: string,
    { page, limit }: PaginationOptions,
    searchTerm?: string
  ): Promise<{ stylists: IStylistDocument[]; totalCount: number }> {
    const query: any = { salon: salonId };
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const result = await this.findAll(query, page, limit);
    await this.model.populate(result.data, { path: "services" });
    return { stylists: result.data, totalCount: result.totalCount };
  }

  async updateStylist(
    id: string,
    stylistData: Partial<IStylist>,
    options?: { populateServices?: boolean }
  ): Promise<IStylistDocument | null> {
    const updateOptions = { new: true, runValidators: true };
    let stylist = await this.updateById(id, stylistData, updateOptions);
    if (stylist && options?.populateServices) {
      stylist = await this.model.populate(stylist, { path: "services" });
    }
    return stylist;
  }

  async deleteStylist(id: string): Promise<boolean> {
    await this.deleteById(id);
    return true
  }
}

export default StylistRepository;