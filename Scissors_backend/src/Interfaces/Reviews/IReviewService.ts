import { IReview, IReviewDocument } from "./IReview";

export interface IReviewService {
    createReview(reviewData: IReview): Promise<IReviewDocument>;
    getSalonReviews(salonId: string): Promise<IReviewDocument[]>;
    getStylistReviews(stylistId: string): Promise<IReviewDocument[]>;
  }