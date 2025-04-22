//API_ENDPOINTS

export const API_ENDPOINTS = {
    USER_SIGNUP: '/signup',
    USER_LOGIN: '/login',
    USER_SIGNOUT: '/signout',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',
    RESET_PASSWORD: '/reset-password',
    GOOGLE_LOGIN: '/auth/google',
}

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


  export const GEOLOCATION_API = 'https://maps.googleapis.com/maps/api/geocode/json'