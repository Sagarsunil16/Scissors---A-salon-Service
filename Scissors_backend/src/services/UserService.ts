import { IUserRepository } from "../Interfaces/User/IUserRepository";
import bcrypt from "bcryptjs";
import { IUser } from "../Interfaces/User/IUser";
import { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import { sendOtpEmail, generateOtp } from "../Utils/otp";
import admin from "../config/firebase";
import crypto from "crypto";
import CustomError from "../Utils/cutsomError";
import { TokenPayload } from "../Interfaces/Auth/IAuthService";
import { IUserService } from "../Interfaces/User/IUserService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";

class UserService implements IUserService {
  private _repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this._repository = repository;
  }

  async createUser(userData: IUser): Promise<IUserDocument> {
    const { email, password, firstname, lastname } = userData;
    if (!email || !password || !firstname || !lastname) {
      throw new CustomError(Messages.INVALID_USER_DATA, HttpStatus.BAD_REQUEST);
    }
    userData.password = await bcrypt.hash(userData.password, 10);
    return await this._repository.createUser(userData);
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await this._repository.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await this._repository.getUserByEmail(email);
  }

  async deleteUser(id: string): Promise<IUserDocument | null> {
    return await this._repository.deleteUser(id);
  }

  async loginUser(
    email: string,
    password: string
  ): Promise<{
    user: IUserDocument;
    accessToken: string;
    refreshToken: string;
  } | null> {
    if (!email || !password) {
      throw new CustomError(Messages.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
    }
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(
        Messages.EMAIL_NOT_FOUND,
        HttpStatus.UNAUTHORIZED
      );
    }
    if (!user.is_Active) {
      throw new CustomError(
        Messages.ACCOUNT_BLOCKED,
        HttpStatus.FORBIDDEN
      );
    }
    if (!user.verified) {
      throw new CustomError(
        Messages.ACCOUNT_NOT_VERIFIED,
        HttpStatus.UNAUTHORIZED
      );
    }
    if (user.role === "Admin") {
      throw new CustomError(
        Messages.UNAUTHORIZED_ADMIN,
        HttpStatus.UNAUTHORIZED
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(
        Messages.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      );
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, active: user.is_Active },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role, active: user.is_Active },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    await this._repository.updateUser(user._id as string, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { user, accessToken, refreshToken };
  }

  async adminLogin(
    email: string,
    password: string
  ): Promise<{
    user: IUserDocument;
    accessToken: string;
    refreshToken: string;
  }> {
    if (!email || !password) {
      throw new CustomError(Messages.MISSING_LOGIN_CREDENTIALS, HttpStatus.BAD_REQUEST);
    }

    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(Messages.LOGIN_ERROR, HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(Messages.LOGIN_ERROR, HttpStatus.UNAUTHORIZED);
    }

    if (user.role !== "Admin") {
      throw new CustomError(Messages.UNAUTHORIZED_ADMIN, HttpStatus.UNAUTHORIZED);
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, active: user.is_Active },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role, active: user.is_Active },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    await this._repository.updateUser(user._id as string, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken, refreshToken };
  }

  async googleLogin(
    idToken: string
  ): Promise<{ user: IUserDocument; token: string; refreshToken: string }> {
    if (!idToken) {
      throw new CustomError(Messages.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;
    if (!email) {
      throw new CustomError(Messages.INVALID_GOOGLE_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const username = name.split(" ");
    let user = await this._repository.getUserByEmail(email);
    if (user && !user.is_Active) {
      throw new CustomError(
        Messages.ACCOUNT_BLOCKED,
        HttpStatus.FORBIDDEN
      );
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");

    if (!user) {
      user = await this._repository.createUser({
        firstname: username[0],
        lastname: username[1] ? username[1] : " ",
        email: email,
        phone: " ",
        password: tempPassword,
        verified: true,
        googleLogin: true,
        role: "User",
      });
      console.log(user);
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    await this._repository.updateUser(user._id as string, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { user, token, refreshToken };
  }

  async signOut(refreshToken: string) {
    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET as string
        ) as TokenPayload;
        if (decoded.role == "User" || decoded.role == "Admin") {
          const user = await this._repository.getUserById(decoded.id);
          if (user) {
            return await this._repository.updateUser(user._id as string, {
              refreshToken: null,
              refreshTokenExpiresAt: null,
            });
          }
        }
      } catch (error) {
        console.warn("Invalid refresh token during sign-out:", error);
      }
    }
  }

  async sendOtp(email: string): Promise<string> {
    if (!email) {
      throw new CustomError(Messages.INVALID_EMAIL, HttpStatus.BAD_REQUEST);
    }
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
    await this._repository.updateUserOtp(email, otp, otpExpiry);
    await sendOtpEmail(email, otp);
    return Messages.OTP_SENT;
  }

  async getAllUsers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ userData: IUserDocument[]; totalUserPages: number }> {
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }

    let query: any = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const { data: users, totalCount: totalUsers } = await this._repository.getAllUsers(page, limit, query);
    if (!users.length) {
      throw new CustomError(Messages.NO_USER_DATA_FOUND, HttpStatus.NOT_FOUND);
    }

    const totalUserPages = Math.ceil(totalUsers / limit);
    return { userData: users, totalUserPages };
  }

  async verifyOTP(email: string, otp: string): Promise<string> {
    if (!email || !otp) {
      throw new CustomError(Messages.INVALID_OTP, HttpStatus.BAD_REQUEST);
    }
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(
        Messages.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    if (!user.otp || !user.otpExpiry || user.otp !== otp) {
      throw new CustomError(
        Messages.INVALID_OTP,
        HttpStatus.BAD_REQUEST
      );
    }
    if (user.otpExpiry < new Date()) {
      throw new CustomError(
        Messages.OTP_EXPIRED,
        HttpStatus.BAD_REQUEST
      );
    }
    await this._repository.verifyOtpAndUpdate(email);
    return Messages.OTP_VERIFIED;
  }

  async resetPassword(email: string, newPassword: string): Promise<string> {
    if (!email || !newPassword) {
      throw new CustomError(Messages.INVALID_USER_DATA, HttpStatus.BAD_REQUEST);
    }
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._repository.resetPassword(email, hashedPassword);
    return Messages.PASSWORD_RESET;
  }

  async updateUser(
    id: string,
    updatedData: Partial<IUser>,
    isAdmin: boolean
  ): Promise<IUserDocument | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id) || !updatedData.firstname || !updatedData.lastname || !updatedData.phone) {
      throw new CustomError(Messages.INVALID_USER_DATA, HttpStatus.BAD_REQUEST);
    }
    if (isAdmin) {
      if (
        !updatedData.firstname ||
        !updatedData.lastname ||
        !updatedData.phone
      ) {
        throw new CustomError(Messages.INVALID_USER_DATA, HttpStatus.BAD_REQUEST);
      }
    } else {
      if (
        !updatedData.firstname ||
        !updatedData.lastname ||
        !updatedData.address
      ) {
        throw new CustomError(Messages.INVALID_USER_DATA, HttpStatus.BAD_REQUEST);
      }
      const { areaStreet, city, state, pincode } = updatedData.address as any;
      if (!areaStreet || !city || !state || !pincode) {
        throw new CustomError(Messages.INVALID_ADDRESS, HttpStatus.BAD_REQUEST);
      }
    }

    const updatedUser = await this._repository.updateUser(id, updatedData);
    if (!updatedUser) {
      throw new CustomError(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return updatedUser;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<string> {
    if (!id || !mongoose.Types.ObjectId.isValid(id) || !currentPassword || !newPassword) {
      throw new CustomError(Messages.MISSING_PASSWORD_FIELDS, HttpStatus.BAD_REQUEST);
    }
    const user = await this._repository.getUserById(id);
    if (!user) {
      throw new CustomError(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new CustomError(Messages.INVALID_CURRENT_PASSWORD, HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._repository.changePassword(id, hashedPassword);

    return Messages.PASSWORD_UPDATED;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<any> {
    return await this._repository.updateUserStatus(id, isActive);
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<any> {
    return await this._repository.updateRefreshToken(id, refreshToken);
  }
}

export default UserService;