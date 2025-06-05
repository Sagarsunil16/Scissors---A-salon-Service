import { NextFunction, Request, Response } from "express";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class OfferController {
  private _offerService: IOfferService;

  constructor(offerService: IOfferService) {
    this._offerService = offerService;
  }

  async createOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const offerData = req.body;
      const offer = await this._offerService.createOffer(userId, offerData);
      res.status(HttpStatus.OK).json({
        message: Messages.OFFER_CREATED,
        offer,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalonOffers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const salonId = req.query.id as string;
      const offers = await this._offerService.getSalonOffer(salonId);
      res.status(HttpStatus.OK).json({
        message: Messages.OFFERS_RETRIEVED,
        offers,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOfferStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const offerId = req.params.id;
      const result = await this._offerService.updateOfferStatus(offerId);
      res.status(HttpStatus.OK).json({
        message: Messages.OFFER_UPDATED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const offerId = req.params.id;
      const result = await this._offerService.deleteOffer(offerId);
      res.status(HttpStatus.OK).json({
        message: Messages.OFFER_DELETED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default OfferController;