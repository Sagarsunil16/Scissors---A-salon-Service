import { NextFunction, Request, Response } from "express";
import { ICategoryService } from "../Interfaces/Category/ICategoryService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

class CategoryController {
  private _categoryService: ICategoryService;

  constructor(categoryService: ICategoryService) {
    this._categoryService = categoryService;
  }

  async getAllCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this._categoryService.getAllCategory();
      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORIES_FETCHED,
        categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFilteredCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const result = await this._categoryService.getFilteredCategory(Number(page), Number(limit), search as string);
      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORIES_FETCHED,
        categories: result.categories,
        Pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async addNewCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData = req.body;
      const result = await this._categoryService.createCategory(categoryData);
      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORY_CREATED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async editCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData = req.body;
      const result = await this._categoryService.updateCategory(categoryData);
      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORY_UPDATED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      console.log(req.body)
      const result = await this._categoryService.deleteCategory(id);
      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORY_DELETED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;