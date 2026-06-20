import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import { Calendar, Clock, IndianRupee, Scissors } from "lucide-react";
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
import SalonSidebar from "@/shared/ui/organisms/dashboard/SalonSidebar";
import SalonHeader from "@/shared/ui/organisms/dashboard/SalonHeader";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import MetricCard from "@/shared/ui/molecules/MetricCard";
import StatusBadge from "@/shared/ui/atoms/StatusBadge";
import { getSalonDashboardData } from "@/features/salon-management/api/salonAPI";
import { getErrorMessage } from "@/shared/lib/errors";

interface DashboardResponse {
  metrics: {
    totalAppointments: number;
    totalRevenue: number;
    totalServices: number;
    pendingAppointments: number;
  };
  revenueTrend: { date: string; revenue: number }[];
  appointmentStatus: { name: string; value: number }[];
  recentAppointments: { _id: string; userName: string; createdAt: string; status: string }[];
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

const SalonDashboard: React.FC = () => {
  const [salonData, setSalonData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalonDashboardData = async () => {
      try {
        const response = await getSalonDashboardData();
        setSalonData(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDashboardData();
  }, []);

  const formatDate = (date: string) => moment.utc(date).tz("Asia/Kolkata").format("Do MMM, YY");

  if (loading) {
    return (
      <DashboardLayout sidebar={<SalonSidebar />} header={<SalonHeader />}>
        <div className="app-surface rounded-lg p-8 text-center text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error || !salonData) {
    return (
      <DashboardLayout sidebar={<SalonSidebar />} header={<SalonHeader />}>
        <div className="app-surface rounded-lg p-8 text-center text-red-600">{error || "No data available"}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<SalonSidebar />} header={<SalonHeader />}>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Performance</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Salon dashboard</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Appointments" value={salonData.metrics.totalAppointments} icon={Calendar} />
        <MetricCard label="Revenue" value={`Rs ${salonData.metrics.totalRevenue.toFixed(0)}`} icon={IndianRupee} />
        <MetricCard label="Services" value={salonData.metrics.totalServices} icon={Scissors} />
        <MetricCard label="Pending" value={salonData.metrics.pendingAppointments} icon={Clock} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="app-surface rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Revenue trend</h3>
            <p className="text-sm text-muted-foreground">Daily booking revenue across recent activity.</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salonData.revenueTrend}>
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
            <p className="text-sm text-muted-foreground">Current distribution by booking state.</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={salonData.appointmentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                {salonData.appointmentStatus.map((_, index) => (
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
          <p className="text-sm text-muted-foreground">Latest customer activity requiring attention.</p>
        </div>
        {salonData.recentAppointments.length === 0 ? (
          <p className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">No recent appointments</p>
        ) : (
          <div className="divide-y divide-border">
            {salonData.recentAppointments.map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-foreground">{appointment.userName}</p>
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

export default SalonDashboard;
