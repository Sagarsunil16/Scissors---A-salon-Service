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
class AdminDashboardService {
    constructor(userRepository, salonRepository, appointmentRepository) {
        this._userRepository = userRepository;
        this._salonRepository = salonRepository;
        this._appointmentRepository = appointmentRepository;
    }
    getAdminDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); //last 30 days
            const endDate = new Date();
            const [totalUsers, totalSalons, totalAppointments, totalRevenue, totalServices, revenueTrend, appointmentStatus, recentAppointments,] = yield Promise.all([
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
                recentAppointments: recentAppointments.map((appt) => {
                    var _a, _b, _c;
                    return ({
                        _id: appt._id.toString(),
                        salonName: (_b = (_a = appt.salon) === null || _a === void 0 ? void 0 : _a.salonName) !== null && _b !== void 0 ? _b : "Unknown",
                        createdAt: (_c = appt.createdAt) !== null && _c !== void 0 ? _c : new Date(), // or use `appt.createdAt!` if you're sure it's never undefined
                        status: appt.status,
                    });
                }),
            };
        });
    }
}
exports.default = AdminDashboardService;
