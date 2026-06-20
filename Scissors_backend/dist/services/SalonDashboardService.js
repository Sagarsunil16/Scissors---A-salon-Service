"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class SalonDashboardService {
    constructor(salonRepository, appointmentRepository) {
        this._salonRepository = salonRepository;
        this._appointmentRepository = appointmentRepository;
    }
    getSalonDashboardData(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Last 30 days
            const endDate = new Date();
            console.log(salonId, "SalonId");
            const [totalAppointments, totalRevenue, totalServices, pendingAppointments, revenueTrend, appointmentStatus, recentAppointments, salon,] = yield Promise.all([
                this._appointmentRepository.countBySalon(salonId),
                this._appointmentRepository.sumRevenueBySalon(salonId),
                this._salonRepository.countServicesBySalon(salonId),
                this._appointmentRepository.countPendingBySalon(salonId),
                this._appointmentRepository.getRevenueTrendBySalon(salonId, startDate, endDate),
                this._appointmentRepository.getStatusCountsBySalon(salonId),
                this._appointmentRepository.getRecentAppointmentsBySalon(salonId, 10),
                this._salonRepository.getSalonById(salonId),
            ]);
            console.log(totalAppointments, totalRevenue, totalServices, pendingAppointments, revenueTrend, appointmentStatus, recentAppointments);
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
                    const user = appt.user;
                    return {
                        _id: appt._id.toString(),
                        userName: `${user.firstname} ${user.lastname}`,
                        createdAt: appt.createdAt,
                        status: appt.status,
                    };
                }),
            };
        });
    }
}
exports.default = SalonDashboardService;
