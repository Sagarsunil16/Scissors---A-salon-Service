import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import Sidebar from "../../Components/Sidebar";
import AdminHeader from "../../Components/AdminHeader";
import moment from "moment-timezone";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from "recharts";
import { Users, Store, Calendar, IndianRupee, Scissors } from "lucide-react";
import { getAdminDashboardData } from "@/Services/adminAPI";

// Define dashboard data type
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

// Colors for pie chart
const COLORS = ["#1e40af", "#f59e0b", "#dc2626"];

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0 && payload[0].value != null) {
    return (
      <div className="bg-white p-1 border border-gray-200 rounded-md shadow-sm">
        <p className="text-xs font-medium text-gray-800">{`Date: ${label}`}</p>
        <p className="text-xs text-gray-600">{`Revenue: ₹${payload[0].value.toFixed(0)}`}</p>
      </div>
    );
  }
  return null;
};

const PieTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-1 border border-gray-200 rounded-md shadow-sm">
        <p className="text-xs font-medium text-gray-800">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
       

        const response = await getAdminDashboardData()
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (date: string) => {
    return moment.utc(date).tz("Asia/Kolkata").format("Do MMM, YYYY");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-red-600">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-5">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">Admin Dashboard</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Left Column: Metrics and Charts */}
            <div className="space-y-3">
              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-base font-semibold text-white">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{dashboardData.metrics.totalUsers}</p>
                        <p className="text-xs text-gray-600">Users</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Store className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{dashboardData.metrics.totalSalons}</p>
                        <p className="text-xs text-gray-600">Salons</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{dashboardData.metrics.totalAppointments}</p>
                        <p className="text-xs text-gray-600">Appointments</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">₹{dashboardData.metrics.totalRevenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Scissors className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{dashboardData.metrics.totalServices}</p>
                        <p className="text-xs text-gray-600">Services</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-base font-semibold text-white">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={dashboardData.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="revenue" stroke="#1e40af" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-base font-semibold text-white">Appointment Status</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={dashboardData.appointmentStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={false}
                      >
                        {dashboardData.appointmentStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Recent Appointments */}
            <div className="space-y-3">
              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-base font-semibold text-white">Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {dashboardData.recentAppointments.length === 0 ? (
                    <p className="text-center text-gray-500 text-xs py-2">No recent appointments</p>
                  ) : (
                    <div className="space-y-2">
                      {dashboardData.recentAppointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-800">{appointment.salonName}</p>
                            <p className="text-xs text-gray-500">{formatDate(appointment.createdAt)}</p>
                          </div>
                          <p
                            className={`text-xs font-semibold ${
                              appointment.status === "Accepted"
                                ? "text-green-600"
                                : appointment.status === "Pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {appointment.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;