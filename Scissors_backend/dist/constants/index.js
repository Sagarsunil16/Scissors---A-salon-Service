"use strict";
//API_ENDPOINTS
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOLOCATION_API = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.ROLES = exports.API_ENDPOINTS = void 0;
exports.API_ENDPOINTS = {
    USER_SIGNUP: '/signup',
    USER_LOGIN: '/login',
    USER_SIGNOUT: '/signout',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',
    RESET_PASSWORD: '/reset-password',
    GOOGLE_LOGIN: '/auth/google',
};
// Roles
exports.ROLES = {
    ADMIN: 'Admin',
    USER: 'User',
    SALON: 'Salon',
};
// Error Messages
exports.ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    SALON_NOT_FOUND: 'Salon not found',
};
// Success Messages
exports.SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    PASSWORD_RESET: 'Password reset successfully',
};
exports.GEOLOCATION_API = 'https://maps.googleapis.com/maps/api/geocode/json';
