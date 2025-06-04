import { IUserDocument } from "../../models/User";
import { ISalonDocument } from "../../models/Salon";

export interface TokenPayload {
  id: string;
  role: string;
  refresh?: boolean;
}

export interface IAuthService {
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    entity: IUserDocument | ISalonDocument;
    role: string;
  }>;
}