import mongoose, { Document, Model } from "mongoose";

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }
  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: object): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async deleteById(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async updateById(id: string, data: Partial<T>,options?:mongoose.QueryOptions): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async findByIdAndUpdate(id:string,update:Partial<T>,options?:mongoose.QueryOptions):Promise<T | null>{
    return await this.model.findByIdAndUpdate(id,update,options)
  }

  async findAll(
    filter: object = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: T[]; totalCount: number }> {
    const skip = (page - 1) * limit;
    const data = await this.model.find(filter).skip(skip).limit(limit);
    const totalCount = await this.model.countDocuments(filter);
    return { data, totalCount };
  }

  async countDocuments(filter: object = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }
}
