import { plainToClass } from "class-transformer";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import { ICategoryService } from "../Interfaces/Category/ICategoryService";
import CustomError from "../Utils/cutsomError";
import mongoose from "mongoose";
import { validate } from "class-validator";


class CategoryService implements ICategoryService {
  private _repository: ICategoryRepository;

  constructor(repository: ICategoryRepository) {
    this._repository = repository;
  }

  async getAllCategory(): Promise<CategoryDto[]> {
   const categories = await this._repository.getAllCategory();
    if (!categories || categories.length === 0) {
      throw new CustomError(Messages.NO_CATEGORIES_FOUND, HttpStatus.NOT_FOUND);
    }
    return categories.map((category) =>
      plainToClass(CategoryDto, {
        _id: (category._id as mongoose.Types.ObjectId).toString(),
        name: category.name,
        description: category.description,
      })
    );
  }

  async getFilteredCategory(page: number | string, limit: number | string, search: string): Promise<{
    categories: CategoryDto[];
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
      categories: categories.map((category) =>
        plainToClass(CategoryDto, {
          _id: (category._id as mongoose.Types.ObjectId).toString(),
          name: category.name,
          description: category.description,
        })
      ),
      totalItems,
      totalPages,
      currentPage: pageNumber,
    };
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<CategoryDto> {
    const createCategoryDto = plainToClass(CreateCategoryDto,categoryData)
    const errors = await validate(createCategoryDto)
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_CATEGORY_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }
    const existingCategory = await this._repository.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new CustomError("Category already exists", HttpStatus.CONFLICT);
    }
    const result = await this._repository.createCategory({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    });

    return plainToClass(CategoryDto, {
      _id: (result._id as mongoose.Types.ObjectId).toString(),
      name: result.name,
      description: result.description,
    });
  }

  async updateCategory(updatedData: UpdateCategoryDto): Promise<CategoryDto | null> {

    const updateCategoryDto = plainToClass(UpdateCategoryDto,updatedData)
    const errors = await validate(updateCategoryDto)
   if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_CATEGORY_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }

    const category = await this._repository.findByIdCategory(updateCategoryDto.id as string);
    if (!category) {
      throw new CustomError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
   const result = await this._repository.updateCategory(updateCategoryDto.id as string, {
      name: updateCategoryDto.name,
      description: updateCategoryDto.description,
    });
    if (!result) {
      throw new CustomError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return plainToClass(CategoryDto, {
      _id: (result._id as mongoose.Types.ObjectId).toString(),
      name: result.name,
      description: result.description,
    });
  }

  async deleteCategory(id: string): Promise<string> {
    if (!id) {
      throw new CustomError(Messages.INVALID_CATEGORY_ID, HttpStatus.BAD_REQUEST);
    }
   const category = await this._repository.findByIdCategory(id);
    if (!category) {
      throw new CustomError(Messages.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this._repository.deleteCategory(id);

    return Messages.CATEGORY_DELETED;
  }
}

export default CategoryService;
