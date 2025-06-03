import { DashboardResponse } from "../Dashboard/IDashboard";

export interface IAdminDashboardService{
    getAdminDashboardData():Promise<DashboardResponse>
}