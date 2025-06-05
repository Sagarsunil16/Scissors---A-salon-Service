import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import { ICategory, ICategoryDocument } from "../Interfaces/Category/ICategory";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import { ICategoryService } from "../Interfaces/Category/ICategoryService";
import CustomError from "../Utils/cutsomError";

class CategoryService implements ICategoryService {
  private _repository: ICategoryRepository;

  constructor(repository: ICategoryRepository) {
    this._repository = repository;
  }

  async getAllCategory(): Promise<ICategoryDocument[]> {
    const result = await this._repository.getAllCategory();
    if (!result || result.length === 0) {
      throw new CustomError(Messages.NO_CATEGORIES_FOUND, HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async getFilteredCategory(page: number | string, limit: number | string, search: string): Promise<{
    categories: ICategoryDocument[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const pageNumber = parseInt(page.toString(), 10);
    const limitNumber = parseInt(limit.toString(), 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }

    const skip = (pageNumber - 1) * limitNumber;
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [categories, totalItems] = await Promise.all([
      this._repository.getCategoriesPaginated(query, skip, limitNumber),
      this._repository.countCategories(query),
    ]);

    const totalPages = Math.ceil(totalItems / limitNumber);

    return {
      categories,
      totalItems,
      totalPages,
      currentPage: pageNumber,
    };
  }

  async createCategory(categoryData: ICategory): Promise<ICategoryDocument> {
    if (!categoryData || Object.keys(categoryData).length === 0 || !categoryData.name || !categoryData.description) {
      throw new CustomError(Messages.INVALID_CATEGORY_DATA, HttpStatus.BAD_REQUEST);
    }
    const result = await this._repository.createCategory(categoryData);
    return result;
  }

  async updateCategory(updatedData: {
    id: string;
    name: string;
    description: string;
  }): Promise<ICategoryDocument | null> {
    const { id, name, description } = updatedData;
    if (!id || !name || !description) {
      throw new CustomError(Messages.INVALID_CATEGORY_DATA, HttpStatus.BAD_REQUEST);
    }
    const category = await this._repository.findByIdCategory(id);
    if (!category) {
      throw new CustomError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const result = await this._repository.updateCategory(id, { name, description });
    return result;
  }

  async deleteCategory(id: string): Promise<string> {
    if (!id) {
      throw new CustomError(Messages.INVALID_CATEGORY_ID, HttpStatus.BAD_REQUEST);
    }
    const result = await this._repository.deleteCategory(id);
    return result;
  }
}

export default CategoryService;
