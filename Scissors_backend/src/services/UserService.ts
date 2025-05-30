import { IUserRepository } from "../Interfaces/User/IUserRepository";
import bcrypt from "bcryptjs";
import { IUser } from "../Interfaces/User/IUser";
import { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import { sendOtpEmail, generateOtp } from "../Utils/otp";
import admin from "../config/firebase";
import crypto from "crypto";
import CustomError from "../Utils/cutsomError";
import { TokenPayload } from "../controllers/AuthController";
import { IUserService } from "../Interfaces/User/IUserService";

class UserService implements IUserService {
  private _repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this._repository = repository;
  }

  async createUser(userData: IUser): Promise<IUserDocument> {
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
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(
        "The email address you entered is not associated with any account. Please check your email or sign up.",
        401
      );
    }
    if (!user.is_Active) {
      throw new CustomError(
        "Your account has been blocked. Please contact support for further assistance.",
        403
      );
    }
    if (!user.verified) {
      throw new CustomError(
        "Please verify your account before logging in. A verification email has been sent.",
        401
      );
    }
    if (user.role === "Admin") {
      throw new CustomError(
        "Unauthorized access. Admin privileges required.",
        401
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(
        "The credentials you entered are incorrect. Please try again.",
        401
      );
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, active: user.is_Active },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role, active: user.is_Active },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;
    if (!email) {
      throw new CustomError("Invalid Google Token: Email is missing", 401);
    }

    const username = name.split(" ");
    let user = await this._repository.getUserByEmail(email);
    if (user && !user.is_Active) {
      throw new CustomError(
        "Your account has been blocked. Please contact support for further assistance.",
        403
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
      { expiresIn: "15m" } // Align with loginUser
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    await this._repository.updateUser(user._id as string, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Store as Date
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
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1minutes
    await this._repository.updateUserOtp(email, otp, otpExpiry);
    await sendOtpEmail(email, otp);
    return "An OTP has been sent to your email. Please check your inbox.";
  }

  async getAllUsers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ data: IUserDocument[]; totalCount: number }> {
    let query: any = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    return await this._repository.getAllUsers(page, limit, query);
  }

  async verifyOTP(email: string, otp: string): Promise<string> {
    const user = await this._repository.getUserByEmail(email);
    if (!user) {
      throw new CustomError(
        "We couldn't find an account associated with this email address.",
        404
      );
    }
    if (!user.otp || !user.otpExpiry || user.otp !== otp) {
      throw new CustomError(
        "The OTP you entered is invalid. Please check and try again.",
        400
      );
    }
    if (user.otpExpiry < new Date()) {
      throw new CustomError(
        "The OTP has expired. Please request a new one.",
        400
      );
    }
    await this._repository.verifyOtpAndUpdate(email);
    return "Verification Successfull";
  }
  async resetPassword(email: string, newPassword: string): Promise<string> {
    const user = this._repository.getUserByEmail(email);
    if (!user) {
      throw new Error("User not Found");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._repository.resetPassword(email, hashedPassword);
    return "Your password has been reset successfully!";
  }

  async updateUser(
    id: string,
    updatedData: Partial<IUser>,
    isAdmin: boolean
  ): Promise<IUserDocument | null> {
    if (isAdmin) {
      if (
        !updatedData.firstname ||
        !updatedData.lastname ||
        !updatedData.phone
      ) {
        throw new Error("firstname,lastname and phone is required");
      }
    } else {
      if (
        !updatedData.firstname ||
        !updatedData.lastname ||
        !updatedData.address
      ) {
        throw new Error("Firstname, Lastname and Address are Required");
      }
      const { areaStreet, city, state, pincode } = updatedData.address as any;
      if (!areaStreet || !city || !state || !pincode) {
        throw new Error("Address fields are incomplete.");
      }
    }

    return this._repository.updateUser(id, updatedData);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<string> {
    const user = await this._repository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._repository.changePassword(id, hashedPassword);

    return "Password updated Successfully";
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<any> {
    return await this._repository.updateUserStatus(id, isActive);
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<any> {
    return await this._repository.updateRefreshToken(id, refreshToken);
  }
}

export default UserService;
