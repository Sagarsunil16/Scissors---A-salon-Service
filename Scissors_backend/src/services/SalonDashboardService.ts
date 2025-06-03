import mongoose from "mongoose";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import { DashboardResponse } from "../Interfaces/Dashboard/IDashboard";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ISalonDashboardService } from "../Interfaces/SalonDashboard/ISalonDashboardService";
import { IUserRepository } from "../Interfaces/User/IUserRepository";

class SalonDashboardService implements ISalonDashboardService {
  private _salonRepository: ISalonRepository;
  private _appointmentRepository: IAppointmentRepository;
  constructor(
    salonRepository: ISalonRepository,
    appointmentRepository: IAppointmentRepository
  ) {
    this._salonRepository = salonRepository;
    this._appointmentRepository = appointmentRepository;
  }

  async getSalonDashboardData(salonId: string): Promise<DashboardResponse> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();

    const [
      totalAppointments,
      totalRevenue,
      totalServices,
      pendingAppointments,
      revenueTrend,
      appointmentStatus,
      recentAppointments,
      salon,
    ] = await Promise.all([
      this._appointmentRepository.countBySalon(salonId),
      this._appointmentRepository.sumRevenueBySalon(salonId),
      this._salonRepository.countServicesBySalon(salonId),
      this._appointmentRepository.countPendingBySalon(salonId),
      this._appointmentRepository.getRevenueTrendBySalon(
        salonId,
        startDate,
        endDate
      ),
      this._appointmentRepository.getStatusCountsBySalon(salonId),
      this._appointmentRepository.getRecentAppointmentsBySalon(salonId, 10),
      this._salonRepository.getSalonById(salonId),
    ]);

    return {
      metrics: {
        totalAppointments,
        totalRevenue,
        totalServices,
        pendingAppointments,
      },
      revenueTrend,
      appointmentStatus,
      recentAppointments: recentAppointments.map((appt) => {
        const user = appt.user as { firstname: string; lastname: string };
        return {
          _id: (appt._id as mongoose.Types.ObjectId).toString(),
          userName: `${user.firstname} ${user.lastname}`,
          createdAt: appt.createdAt!, 
          status: appt.status,
        };
      }),
    };
  }
}

export default SalonDashboardService;
