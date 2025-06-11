import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import SalonSidebar from "../../Components/SalonSidebar";
import SalonHeader from "../../Components/SalonHeader";
import moment from "moment-timezone";
import { getSalonDashboardData } from "@/Services/salonAPI";
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
import { Calendar, IndianRupee, Scissors, Clock } from "lucide-react";

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

const SalonDashboard: React.FC = () => {
  const [salonData, setSalonData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalonDashboardData = async () => {
      try {
        const response = await getSalonDashboardData();
        setSalonData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchSalonDashboardData();
  }, []);

  const formatDate = (date: string) => {
    return moment.utc(date).tz("Asia/Kolkata").format("Do MMM, YY");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !salonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-red-600">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <main className="flex-1 p-3 sm:p-4">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Salon Dashboard</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-sm font-semibold text-white">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-md">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-base font-bold text-gray-900">{salonData.metrics.totalAppointments}</p>
                        <p className="text-xs text-gray-600">Appointments</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-md">
                      <IndianRupee className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-base font-bold text-gray-900">₹{salonData.metrics.totalRevenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-md">
                      <Scissors className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-base font-bold text-gray-900">{salonData.metrics.totalServices}</p>
                        <p className="text-xs text-gray-600">Services</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-md">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-base font-bold text-gray-900">{salonData.metrics.pendingAppointments}</p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-sm font-semibold text-white">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={salonData.revenueTrend}>
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
                  <CardTitle className="text-sm font-semibold text-white">Appointment Status</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={salonData.appointmentStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        label={false}
                      >
                        {salonData.appointmentStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Card className="shadow-xl rounded-lg bg-white overflow-hidden transform transition-all hover:scale-[1.01]">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg p-2">
                  <CardTitle className="text-sm font-semibold text-white">Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {salonData.recentAppointments.length === 0 ? (
                    <p className="text-center text-gray-500 text-xs py-1">No recent appointments</p>
                  ) : (
                    <div className="space-y-1">
                      {salonData.recentAppointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-800">{appointment.userName}</p>
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

export default SalonDashboard;