// API Endpoints
export const API_ENDPOINTS = {
    BASE_URL: 'https://api.scissors.hair/',
    USER_SIGNUP: '/signup',
    USER_LOGIN: '/login',
    USER_SIGNOUT: '/signout',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',
    RESET_PASSWORD: '/reset-password',
    GOOGLE_LOGIN: '/auth/google',
    REFRESH_TOKEN: '/auth/refresh-token'
  };
  
  // Roles
  export const ROLES = {
    ADMIN: 'Admin',
    USER: 'User',
    SALON: 'Salon',
  };
  
  // Error Messages
  export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    SALON_NOT_FOUND: 'Salon not found',
  };
  
  // Success Messages
  export const SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    PASSWORD_RESET: 'Password reset successfully',
  };