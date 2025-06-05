import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import { IWalletService } from "../Interfaces/Wallet/IWalletService";


interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class WalletController {
  private _walletService: IWalletService;

  constructor(walletService: IWalletService) {
    this._walletService = walletService;
  }

  async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      console.log(userId, "userid");
      const balance = await this._walletService.getBalance(userId as string);
      res.status(HttpStatus.OK).json({
        message: Messages.WALLET_BALANCE_FETCHED,
        data: { balance },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getTransactionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { page = "1", limit = "10" } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const history = await this._walletService.getTransactionHistory(userId as string, pageNumber, limitNumber);
      res.status(HttpStatus.OK).json({
        message: Messages.WALLET_HISTORY_FETCHED,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default WalletController;