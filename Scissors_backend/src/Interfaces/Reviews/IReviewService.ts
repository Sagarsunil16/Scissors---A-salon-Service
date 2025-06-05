import { IReview, IReviewDocument } from "./IReview";

export interface IReviewService {
  createReview(userId: string | undefined, reviewData: Partial<IReview>): Promise<IReviewDocument>;
  getSalonReviews(salonId: string): Promise<IReviewDocument[]>;
  getStylistReviews(stylistId: string): Promise<IReviewDocument[]>;
}