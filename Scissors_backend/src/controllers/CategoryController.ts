import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
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
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_CATEGORIES_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getFilteredCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const pageNumber = parseInt(page.toString(), 10);
      const limitNumber = parseInt(limit.toString(), 10);

      if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
      }

      const result = await this._categoryService.getFilteredCategory(pageNumber, limitNumber, search as string);

      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORIES_FETCHED,
        categories: result.categories,
        Pagination: {
          totalItems: result.totalItems,
          totalPages: Math.ceil(result.totalItems / limitNumber),
          currentPage: pageNumber,
        },
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_CATEGORIES_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async addNewCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData = req.body;
      if (!categoryData || Object.keys(categoryData).length === 0) {
        throw new CustomError(Messages.INVALID_CATEGORY_DATA, HttpStatus.BAD_REQUEST);
      }

      const result = await this._categoryService.createCategory(categoryData);

      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORY_CREATED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.CREATE_CATEGORY_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async editCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData = req.body;
      if (!categoryData || !categoryData.id) {
        throw new CustomError(Messages.INVALID_CATEGORY_DATA, HttpStatus.BAD_REQUEST);
      }

      const result = await this._categoryService.updateCategory(categoryData);

      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORY_UPDATED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.UPDATE_CATEGORY_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      if (!id) {
        throw new CustomError(Messages.INVALID_CATEGORY_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._categoryService.deleteCategory(id);

      res.status(HttpStatus.OK).json({
        message: Messages.CATEGORY_DELETED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.DELETE_CATEGORY_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default CategoryController;