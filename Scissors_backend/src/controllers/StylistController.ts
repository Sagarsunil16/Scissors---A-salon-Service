import { Request, Response } from "express";
import { stylistService } from "../config/di";
class StylistController {
  async createStylist(req: Request, res: Response): Promise<void> {
    try {
      const result = await stylistService.createStylist(req.body);
      res.status(200).json({ message: "Stylist Created Successfully", result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal Server Issue" });
    }
  }

  async getStylistbySalonId(req: Request, res: Response): Promise<void> {
    try {
      const { id, page, limit, search } = req.query;
      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      };
      const result = await stylistService.findStylist(
        id as string,
        options,
        search as string
      );
      console.log(result);
      res
        .status(200)
        .json({ message: "Fetched Stylist Data Successfully!", result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal Server Issue" });
    }
  }

  async updateStylist(req: Request, res: Response): Promise<void> {
    try {
      const updatedStylist = await stylistService.updateStylist(
        req.params.id,
        req.body
      );
      if (!updatedStylist) {
        res.status(404).json({
          success: false,
          message: "Stylist not found",
        });
      }

      res.json({
        message: "Updated Successfully",
        success: true,
        data: updatedStylist,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new StylistController();
