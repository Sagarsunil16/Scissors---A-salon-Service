import mongoose from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { ICategory, ICategoryDocument } from "../Interfaces/Category/ICategory";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import Category from "../models/Category";

class CategoryRepository extends BaseRepository<ICategoryDocument> implements ICategoryRepository {
  constructor() {
    super(Category);
  }

  async findByIdCategory(id: string): Promise<ICategoryDocument | null> {
    return await this.model.findById(id).lean().exec();
  }

  async findByName(name: string): Promise<ICategoryDocument | null> {
    return await this.model.findOne({ name }).lean().exec();
  }

  async getAllCategory(): Promise<ICategoryDocument[]> {
    return await this.model.find({}).lean().exec();
  }

  async createCategory(categoryData: ICategory): Promise<ICategoryDocument> {
    return await this.create(categoryData);
  }

  async updateCategory(
    id: string,
    updatedData: { name: string; description: string }
  ): Promise<ICategoryDocument | null> {
    return await this.model.findByIdAndUpdate(id , { ...updatedData }, { new: true }).lean().exec();
  }

  async deleteCategory(id: string): Promise<ICategoryDocument | null> {
    return await this.model.findByIdAndDelete(id).lean().exec();
  }

  async getCategoriesPaginated(
    query: mongoose.FilterQuery<ICategoryDocument>,
    skip: number,
    limit: number
  ): Promise<ICategoryDocument[]> {
    return await this.model.find(query).skip(skip).limit(limit).lean().exec();
  }

  async countCategories(query: mongoose.FilterQuery<ICategoryDocument>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }
}

export default CategoryRepository;