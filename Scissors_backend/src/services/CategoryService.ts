import { ICategory, ICategoryDocument } from "../Interfaces/Category/ICategory";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";

class CategoryService {
  private repository: ICategoryRepository;
  constructor(repository: ICategoryRepository) {
    this.repository = repository;
  }
  async getAllCategory(): Promise<ICategoryDocument[]> {
    const result = await this.repository.getAllCategory();
    return result;
  }
  async createCategory(categoryData: ICategory): Promise<ICategoryDocument> {
    const { name, description } = categoryData;
    if (!name || !description) {
      throw new Error("Category name and descripton is required");
    }
    const result = await this.repository.createCategory(categoryData);
    return result;
  }

  async updateCategory(updatedData: {
    id: string;
    name: string;
    description: string;
  }): Promise<ICategoryDocument | null> {
    const { id, ...data } = updatedData;
    const category = this.repository.findByIdCategory(id);
    if (!category) {
      throw new Error("Category Not Found");
    }
    if (!data.name || !data.description) {
      throw new Error("Name And Category Required");
    }
    const result = await this.repository.updateCategory(id, data);
    return result;
  }

  async deleteCategory(id: string): Promise<string> {
    if (!id) {
      throw new Error("Id not found");
    }
    const result = await this.repository.deleteCategory(id);
    console.log(result);
    return result;
  }
}

export default CategoryService;
