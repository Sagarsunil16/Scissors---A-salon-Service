import { IAdminDashboardService } from "../Interfaces/AdminDashboard/IAdminDashboardService";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import { DashboardResponse } from "../Interfaces/Dashboard/IDashboard";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { IUserRepository } from "../Interfaces/User/IUserRepository";
import mongoose from "mongoose";

class AdminDashboardService implements IAdminDashboardService {
  private _userRepository: IUserRepository;
  private _salonRepository: ISalonRepository;
  private _appointmentRepository: IAppointmentRepository;
  constructor(
    userRepository: IUserRepository,
    salonRepository: ISalonRepository,
    appointmentRepository: IAppointmentRepository
  ) {
    this._userRepository = userRepository;
    this._salonRepository = salonRepository;
    this._appointmentRepository = appointmentRepository;
  }

  async getDashboardData(): Promise<DashboardResponse> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); //last 30 days
    const endDate = new Date();

    const [
      totalUsers,
      totalSalons,
      totalAppointments,
      totalRevenue,
      totalServices,
      revenueTrend,
      appointmentStatus,
      recentAppointments,
    ] = await Promise.all([
      this._userRepository.countActiveUsers(),
      this._salonRepository.countActiveSalons(),
      this._appointmentRepository.countAll(),
      this._appointmentRepository.sumRevenue(),
      this._salonRepository.countUniqueServices(),
      this._appointmentRepository.getRevenueTrend(startDate, endDate),
      this._appointmentRepository.getStatusCounts(),
      this._appointmentRepository.getRecentAppointments(10),
    ]);

    return {
      metrics: {
        totalUsers,
        totalSalons,
        totalAppointments,
        totalRevenue,
        totalServices,
      },
      revenueTrend,
      appointmentStatus,
      recentAppointments: recentAppointments.map((appt) => ({
        _id: (appt._id as mongoose.Types.ObjectId).toString(),
        salonName: (appt.salon as any)?.salonName ?? "Unknown",
        createdAt: appt.createdAt ?? new Date(), // or use `appt.createdAt!` if you're sure it's never undefined
        status: appt.status,
      })),
    };
  }
}

export default AdminDashboardService;
