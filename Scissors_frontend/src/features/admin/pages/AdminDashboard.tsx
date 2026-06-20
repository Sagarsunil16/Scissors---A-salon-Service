import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import { Calendar, IndianRupee, Scissors, Store, Users } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "@/shared/ui/organisms/dashboard/AdminSidebar";
import AdminHeader from "@/shared/ui/organisms/dashboard/AdminHeader";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import MetricCard from "@/shared/ui/molecules/MetricCard";
import StatusBadge from "@/shared/ui/atoms/StatusBadge";
import { getAdminDashboardData } from "@/features/admin/api/adminAPI";

interface DashboardResponse {
  metrics: {
    totalUsers: number;
    totalSalons: number;
    totalAppointments: number;
    totalRevenue: number;
    totalServices: number;
  };
  revenueTrend: { date: string; revenue: number }[];
  appointmentStatus: { name: string; value: number }[];
  recentAppointments: { _id: string; salonName: string; createdAt: string; status: string }[];
}

const COLORS = ["#1f6f61", "#d6a244", "#d95745"];

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0 && payload[0].value != null) {
    return (
      <div className="rounded-md border border-border bg-white p-3 shadow-sm">
        <p className="text-xs font-medium text-foreground">Date: {label}</p>
        <p className="text-xs text-muted-foreground">Revenue: Rs {payload[0].value.toFixed(0)}</p>
      </div>
    );
  }
  return null;
};

const PieTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-md border border-border bg-white p-3 shadow-sm">
        <p className="text-xs font-medium text-foreground">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getAdminDashboardData();
        setDashboardData(response.data);
      } catch {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (date: string) => moment.utc(date).tz("Asia/Kolkata").format("Do MMM, YYYY");

  if (loading) {
    return (
      <DashboardLayout sidebar={<Sidebar />} header={<AdminHeader />}>
        <div className="app-surface rounded-lg p-8 text-center text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <DashboardLayout sidebar={<Sidebar />} header={<AdminHeader />}>
        <div className="app-surface rounded-lg p-8 text-center text-red-600">{error || "No data available"}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<Sidebar />} header={<AdminHeader />}>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Platform overview</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Admin dashboard</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Users" value={dashboardData.metrics.totalUsers} icon={Users} />
        <MetricCard label="Salons" value={dashboardData.metrics.totalSalons} icon={Store} />
        <MetricCard label="Appointments" value={dashboardData.metrics.totalAppointments} icon={Calendar} />
        <MetricCard label="Revenue" value={`Rs ${dashboardData.metrics.totalRevenue.toFixed(0)}`} icon={IndianRupee} />
        <MetricCard label="Services" value={dashboardData.metrics.totalServices} icon={Scissors} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="app-surface rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Revenue trend</h3>
            <p className="text-sm text-muted-foreground">Platform revenue across recent bookings.</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d8" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#1f6f61" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="app-surface rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Appointment status</h3>
            <p className="text-sm text-muted-foreground">Distribution across the marketplace.</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dashboardData.appointmentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                {dashboardData.appointmentStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="app-surface mt-6 rounded-lg p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent appointments</h3>
          <p className="text-sm text-muted-foreground">Newest platform booking activity.</p>
        </div>
        {dashboardData.recentAppointments.length === 0 ? (
          <p className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">No recent appointments</p>
        ) : (
          <div className="divide-y divide-border">
            {dashboardData.recentAppointments.map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-foreground">{appointment.salonName}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(appointment.createdAt)}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
