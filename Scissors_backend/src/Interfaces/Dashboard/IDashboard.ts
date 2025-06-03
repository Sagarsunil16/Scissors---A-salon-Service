export interface DashboardMetric {
  totalAppointments: number;
  totalRevenue: number;
  totalServices: number;
  pendingAppointments?: number;
  totalUsers?: number;
  totalSalons?: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface AppointmentStatus {
  name: string;
  value: number;
}

export interface RecentAppointment {
  _id: string;
  userName?: string;
  salonName?: string;
  createdAt: Date;
  status: string;
}

export interface DashboardResponse {
  metrics: DashboardMetric;
  revenueTrend: RevenueTrend[];
  appointmentStatus: AppointmentStatus[];
  recentAppointments: RecentAppointment[];
}