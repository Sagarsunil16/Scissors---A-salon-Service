import { DashboardResponse } from "../Dashboard/IDashboard";

export interface ISalonDashboardService{
    getSalonDashboardData(salonId:string):Promise<DashboardResponse>
}