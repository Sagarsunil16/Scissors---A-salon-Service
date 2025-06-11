import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from "../../dto/category.dto";
import { ICategory, ICategoryDocument } from "./ICategory";

export interface ICategoryService{
    getAllCategory(): Promise<CategoryDto[]>;
    getFilteredCategory(
      page: number,
      limit: number,
      search: string
    ): Promise<{ categories: CategoryDto[]; totalItems: number,totalPages: number;currentPage: number; }>;
    createCategory(categoryData: CreateCategoryDto): Promise<CategoryDto>;
    updateCategory(updatedData: UpdateCategoryDto): Promise<CategoryDto | null>;
    deleteCategory(id: string): Promise<string>;
}