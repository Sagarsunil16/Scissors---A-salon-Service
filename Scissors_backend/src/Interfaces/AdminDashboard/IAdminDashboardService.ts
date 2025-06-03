import { DashboardResponse } from "../Dashboard/IDashboard";

export interface IAdminDashboardService{
    getDashboardData():Promise<DashboardResponse>
}