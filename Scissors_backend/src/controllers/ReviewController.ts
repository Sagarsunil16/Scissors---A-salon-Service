import { Request, Response, NextFunction } from "express";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class ReviewController {
  private _reviewService: IReviewService;

  constructor(reviewService: IReviewService) {
    this._reviewService = reviewService;
  }

  async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const reviewData = req.body;
      const review = await this._reviewService.createReview(userId, reviewData);
      res.status(HttpStatus.OK).json({
        message: Messages.REVIEW_CREATED,
        review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalonReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = await this._reviewService.getSalonReviews(id);
      res.status(HttpStatus.OK).json({
        message: Messages.SALON_REVIEWS_RETRIEVED,
        reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStylistReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = await this._reviewService.getStylistReviews(id);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_REVIEWS_RETRIEVED,
        reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ReviewController;