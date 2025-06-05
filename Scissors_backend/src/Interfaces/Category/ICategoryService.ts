import { ICategory, ICategoryDocument } from "./ICategory";

export interface ICategoryService{
    getAllCategory(): Promise<ICategoryDocument[]>;
    getFilteredCategory(
      page: number,
      limit: number,
      search: string
    ): Promise<{ categories: ICategoryDocument[]; totalItems: number,totalPages: number;currentPage: number; }>;
    createCategory(categoryData: ICategory): Promise<ICategoryDocument>;
    updateCategory(updatedData: {
      id: string;
      name: string;
      description: string;
    }): Promise<ICategoryDocument | null>;
    deleteCategory(id: string): Promise<string>;
}