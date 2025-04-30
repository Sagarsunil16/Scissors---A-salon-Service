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
    return await this.findById(id);
  }

  async findByName(name: string): Promise<ICategoryDocument | null> {
    return await this.findOne({ name });
  }

  async getAllCategory(): Promise<ICategoryDocument[]> {
    return await this.model.find({}).exec();
  }

  async createCategory(categoryData: ICategory): Promise<ICategoryDocument> {
    return await this.create(categoryData);
  }

  async updateCategory(
    id: string,
    updatedData: { name: string; description: string }
  ): Promise<ICategoryDocument | null> {
    return await this.findOneAndUpdate({ _id: id }, { ...updatedData }, { new: true });
  }

  async deleteCategory(id: string): Promise<ICategoryDocument | null> {
    return await this.deleteById(id);
  }

  async getCategoriesPaginated(
    query: mongoose.FilterQuery<ICategoryDocument>,
    skip: number,
    limit: number
  ): Promise<ICategoryDocument[]> {
    const result = await this.findAll(query, Math.floor(skip / limit) + 1, limit);
    return result.data;
  }

  async countCategories(query: mongoose.FilterQuery<ICategoryDocument>): Promise<number> {
    return await this.countDocuments(query);
  }
}

export default CategoryRepository;