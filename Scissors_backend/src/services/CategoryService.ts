import { ICategory, ICategoryDocument } from "../Interfaces/Category/ICategory";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import { ICategoryService } from "../Interfaces/Category/ICategoryService";
import CustomError from "../Utils/cutsomError";

class CategoryService implements ICategoryService {
  private repository: ICategoryRepository;
  constructor(repository: ICategoryRepository) {
    this.repository = repository;
  }
  async getAllCategory(): Promise<ICategoryDocument[]> {
    const result = await this.repository.getAllCategory();
    if (!result || result.length === 0) {
      throw new CustomError("No categories found. Please add some categories first.", 404);
    }
    return result;
  }

  async getFilteredCategory(page:number,limit:number,search:string):Promise<{categories:ICategoryDocument[];totalItems:number}>{
   const skip = (page-1) * limit
   const query:any = {}
   if(search){
    query.$or = [
      {name:{$regex:search,$options:'i'}},
      {description:{$regex:search,$options:'i'}}
    ]
   }
   const [categories,totalItems] = await Promise.all([
    await this.repository.getCategoriesPaginated(query,skip,limit),
    await this.repository.countCategories(query)
   ])

   return {categories,totalItems}
  }
  async createCategory(categoryData: ICategory): Promise<ICategoryDocument> {
    const { name, description } = categoryData;
    if (!name || !description) {
      throw new CustomError("Both category name and description are required to create a new category.", 400);
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
      throw new CustomError("Category not found. Please verify the category ID and try again.", 404);
    }
    if (!data.name || !data.description) {
      throw new CustomError("Both category name and description are required to update the category.", 400);
    }
    const result = await this.repository.updateCategory(id, data);
    return result;
  }

  async deleteCategory(id: string): Promise<string> {
    if (!id) {
      throw new CustomError("Category ID is required to delete a category.", 400);
    }
    const result = await this.repository.deleteCategory(id);
    console.log(result);
    return result;
  }
}

export default CategoryService;
