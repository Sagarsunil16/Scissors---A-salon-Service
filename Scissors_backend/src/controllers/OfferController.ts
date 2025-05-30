import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
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
      if (!userId) {
        throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
      }

      const { salonId, title, description, discount, serviceIds, expiryDate } = req.body;
      if (!salonId || !title || !discount || !serviceIds || !expiryDate) {
        throw new CustomError(Messages.INVALID_OFFER_DATA, HttpStatus.BAD_REQUEST);
      }

      const offer = await this._offerService.createOffer({
        salonId,
        title,
        description,
        discount,
        serviceIds,
        expiryDate,
      });

      res.status(HttpStatus.OK).json({
        message: Messages.OFFER_CREATED,
        offer,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.CREATE_OFFER_FAILED, error.status || HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getSalonOffers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const salonId = req.query.id as string;
      if (!salonId) {
        throw new CustomError(Messages.SALON_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const offers = await this._offerService.getSalonOffer(salonId);

      res.status(HttpStatus.OK).json({
        message: Messages.OFFERS_RETRIEVED,
        offers,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_OFFERS_FAILED, error.status || HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
  async updateOfferStatus(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
    try {
      const offerId = req.params.id
      const result = await this._offerService.updateOfferStatus(offerId)
      if(!result){
        throw new CustomError("Offer not found",HttpStatus.NOT_FOUND)
      }
      res.status(HttpStatus.OK).json({message:"Updated Successfully"})
    } catch (error) {
      next(error)
    }
  }
  async deleteOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const offerId = req.params.id;
      if (!offerId) {
        throw new CustomError(Messages.INVALID_OFFER_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._offerService.deleteOffer(offerId);

      res.status(HttpStatus.OK).json({
        message: Messages.OFFER_DELETED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.DELETE_OFFER_FAILED, error.status || HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default OfferController;