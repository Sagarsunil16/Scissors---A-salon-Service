import { Request, Response, NextFunction } from "express";
  import CustomError from "../Utils/cutsomError";
  import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";
  import { Messages } from "../constants/Messages";
  import { HttpStatus } from "../constants/HttpStatus";

  interface AuthenticatedRequest extends Request {
    user?: { id: string };
  }

  class AppointmentController {
    private _appointmentService: IAppointmentService;

    constructor(appointmentService: IAppointmentService) {
      this._appointmentService = appointmentService;
    }

    async getAppointmentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        const appointmentId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
          throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
        }
        const appointment = await this._appointmentService.getAppointmentDetails(appointmentId, userId);

        res.status(HttpStatus.OK).json({
          message: Messages.APPOINTMENT_DETAILS_FETCHED,
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
          throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
        }

        const result = await this._appointmentService.getUserAppointments(
          userId,
          status?.toString(),
          Number(page),
          Number(limit)
        );

        res.status(HttpStatus.OK).json({
          message: Messages.USER_APPOINTMENTS_SUCCESS,
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
          throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
        }

        const result = await this._appointmentService.getSalonAppointments(
          salonId,
          status?.toString(),
          Number(page),
          Number(limit)
        );

        res.status(HttpStatus.OK).json({
          message: Messages.SALON_APPOINTMENTS_SUCCESS,
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
          throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
        }

        const { appointment, message } = await this._appointmentService.cancelAppointment(id, salonId);

        res.status(HttpStatus.OK).json({
          message,
          data: appointment,
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
          throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
        }

        const updatedAppointment = await this._appointmentService.completeAppointment(id, salonId);

        res.status(HttpStatus.OK).json({
          message: Messages.APPOINTMENT_COMPLETED,
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
          throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
        }

        const { appointment, message } = await this._appointmentService.cancelAppointmentByUser(appointmentId, userId);

        res.status(HttpStatus.OK).json({
          message,
          data: appointment,
        });
      } catch (error) {
        next(error);
      }
    }
}

export default AppointmentController;