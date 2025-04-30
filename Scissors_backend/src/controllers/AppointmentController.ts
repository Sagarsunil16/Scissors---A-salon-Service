import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CustomError from "../Utils/cutsomError";
import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class AppointmentController {
  private appointmentService: IAppointmentService;

  constructor(appointmentService: IAppointmentService) {
    this.appointmentService = appointmentService;
  }

  async getAppointmentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError("Authentication required.", 401);
      }

      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new CustomError("Invalid appointment ID.", 400);
      }

      const appointment = await this.appointmentService.getAppointmentDetails(appointmentId, userId);
      if (!appointment) {
        throw new CustomError("Appointment not found.", 404);
      }

      res.status(200).json({
        message: "Appointment details fetched successfully.",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { status, page = "1", limit = "10" } = req.query;

      if (!userId) {
        throw new CustomError("Authentication required.", 401);
      }

      const result = await this.appointmentService.getUserAppointments(
        userId,
        status?.toString(),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        message: "User appointments fetched successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalonAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const salonId = req.user?.id;
      const { status, page = "1", limit = "10" } = req.query;

      if (!salonId) {
        throw new CustomError("Authentication required.", 401);
      }

      const result = await this.appointmentService.getSalonAppointments(
        salonId,
        status?.toString(),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        message: "Salon appointments fetched successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const salonId = req.user?.id;

      if (!salonId) {
        throw new CustomError("Authentication required.", 401);
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError("Invalid appointment ID.", 400);
      }

      const updatedAppointment = await this.appointmentService.cancelAppointment(id, salonId);
      if (!updatedAppointment) {
        throw new CustomError("Appointment not found or cannot be cancelled.", 404);
      }

      res.status(200).json({
        message: "Appointment cancelled successfully.",
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const salonId = req.user?.id;

      if (!salonId) {
        throw new CustomError("Authentication required.", 401);
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError("Invalid appointment ID.", 400);
      }

      const updatedAppointment = await this.appointmentService.completeAppointment(id, salonId);
      if (!updatedAppointment) {
        throw new CustomError("Appointment not found or cannot be completed.", 404);
      }

      res.status(200).json({
        message: "Appointment marked as completed successfully.",
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointmentByUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError("Authentication required.", 401);
      }

      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new CustomError("Invalid appointment ID.", 400);
      }

      const updatedAppointment = await this.appointmentService.cancelAppointmentByUser(appointmentId, userId);
      if (!updatedAppointment) {
        throw new CustomError("Appointment not found or cannot be cancelled.", 404);
      }

      res.status(200).json({
        message: "Appointment cancelled successfully.",
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AppointmentController;