# Scissors Project Progress Document

This document tracks the redesign, frontend architecture refactor, backend flow fixes, and verification work completed so far. We will update it gradually as each section of the project is improved.

## Frontend Architecture Direction

The frontend is being moved toward two architecture principles:

### Atomic Design — Component Layer

Reusable UI components are organized under:

- `src/shared/ui/atoms`
- `src/shared/ui/molecules`
- `src/shared/ui/organisms`
- `src/shared/ui/primitives`

The goal is to keep shared UI reusable, predictable, and independent from specific business domains.

### Domain-Driven Layered Architecture — Application Layer

Feature and domain-specific code is being organized under:

- `src/features/auth`
- `src/features/user`
- `src/features/admin`
- `src/features/booking`
- `src/features/messaging`
- `src/features/profile`
- `src/features/salon-discovery`
- `src/features/salon-management`
- `src/features/wallet`

The current migration is gradual. Old folders such as `src/Pages`, `src/Components`, and `src/Services` still exist for compatibility, but the target is to keep `Pages` mostly as route wrappers and move real feature logic into `src/features`.

## Design Direction

The new frontend UI direction is:

- Professional salon booking product style
- Clean, restrained, modern layout
- Responsive mobile-first behavior
- Better typography, spacing, and form states
- Auth pages use a consistent professional layout
- Desktop auth pages use two-column layouts with branded side panels
- Mobile auth pages collapse into focused single-column screens
- Forms use clear validation, loading states, and helpful error messages

## Backend Fixes Completed

### Firebase Startup

Firebase configuration no longer crashes the backend when the service account file is missing.

Current behavior:

- Backend logs a warning if Firebase credentials are unavailable.
- Google login becomes unavailable until credentials are provided.
- Server can still start for non-Google auth flows.

Supported Firebase credential sources:

- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `secureDocs/serviceAccount.json`

### MongoDB Local Development

MongoDB was adjusted for local development.

Current local Mongo URL:

```txt
mongodb://127.0.0.1:27017/scissors
```

Docker Mongo support was added or updated in `Scissors_backend/docker-compose.yml`.

### Backend Error Handling

The global error handler now returns a cleaner JSON structure:

```json
{
  "message": "Error message",
  "error": "Error message"
}
```

This helps the frontend display backend errors consistently.

## JWT And Token Refresh Flow

The JWT flow was reviewed and fixed for local development.

Current token behavior:

- Access token expires in 15 minutes.
- Refresh token expires in 7 days.
- Refresh token is stored in the database with an expiry date.
- Protected API requests return `401` when the access token expires.
- Frontend interceptor calls `/auth/refresh-token`.
- Backend verifies the refresh token.
- Backend issues a new access token cookie.
- Frontend retries the failed request.

Fixes completed:

- Replaced hardcoded production refresh URL with `VITE_API_URL`.
- Added fallback API URL: `http://localhost:3000`.
- Removed frontend attempts to read `authToken` from `document.cookie`.
- Normalized cookie options across user, admin, and salon auth flows.
- Added consistent `sameSite` handling.

Important note:

The auth cookie is `httpOnly`, so frontend JavaScript cannot read it. This is correct. The browser sends it automatically because Axios uses `withCredentials: true`.

## Sign In Flow

### Frontend

Updated:

- `Scissors_frontend/src/features/auth/components/SignIn.tsx`
- `Scissors_frontend/src/Pages/User/UserLogin.tsx`

Improvements:

- Professional responsive sign-in layout.
- Cleaner form design.
- Better loading and error states.
- Correct redirect after login.
- Better Axios error handling.
- Removed debug logging.

### Backend

Updated:

- `Scissors_backend/src/controllers/UserController.ts`

Improvements:

- Added missing email/password validation.
- Removed debug logging.
- Improved cookie options for normal login and Google login.

## Sign Up Flow

### Frontend

Updated:

- `Scissors_frontend/src/features/auth/components/UserSignUp.tsx`
- `Scissors_frontend/src/features/user/api/UserAPI.ts`

Improvements:

- Professional responsive signup page.
- Strong form validation.
- Better loading and error states.
- Typed signup API payload.
- Sends only required signup data to backend.
- Navigates to `/signup/verify` after successful signup.

Validation includes:

- First name required.
- Last name required.
- Valid email required.
- 10-digit phone number required.
- Strong password required.
- Confirm password must match.

### Backend

Updated:

- `Scissors_backend/src/services/UserService.ts`
- `Scissors_backend/src/constants/Messages.ts`

Improvements:

- Added duplicate email check.
- Added `EMAIL_ALREADY_EXISTS` message.
- Duplicate signup now returns conflict behavior instead of failing later.

## Signup OTP Verification

Route:

```txt
/signup/verify
```

Updated:

- `Scissors_frontend/src/features/auth/components/OTP.tsx`
- `Scissors_frontend/src/Pages/User/OTPverification.tsx`
- `Scissors_backend/src/constants/Messages.ts`

Improvements:

- Replaced old OTP screen with professional auth design.
- Made OTP page mobile responsive.
- Added masked email display.
- Added resend timer UX.
- Added verify and resend loading states.
- Removed console logs.
- Removed `any` error handling.
- Missing email now redirects to `/signup`.
- Improved backend expired OTP message to `OTP has expired`.

## Forgot Password Flow

Routes:

```txt
/forgot-password
/forgot-password/otp
/forgot-password/reset
```

### Frontend

Updated:

- `Scissors_frontend/src/features/auth/components/ForgotPasswordEmail.tsx`
- `Scissors_frontend/src/features/auth/components/ForgotPasswordOTP.tsx`
- `Scissors_frontend/src/features/auth/components/ResetPassword.tsx`
- `Scissors_frontend/src/features/auth/components/OTP.tsx`
- `Scissors_frontend/src/Pages/User/ForgotPassword.tsx`
- `Scissors_frontend/src/Pages/User/ForgotOtp.tsx`
- `Scissors_frontend/src/Pages/User/ResetPass.tsx`

Improvements:

- Redesigned forgot password email screen.
- Reused shared OTP component for forgot password OTP.
- Redesigned reset password screen.
- Removed footer-heavy old auth layout from these pages.
- Added better loading states.
- Added improved validation and error handling.
- Kept implementation under `src/features/auth/components`.

### Backend

Updated:

- `Scissors_backend/src/controllers/UserController.ts`
- `Scissors_backend/src/services/UserService.ts`

Security improvement:

- Reset password is no longer protected only by frontend route state.
- After OTP verification with `purpose: "password-reset"`, backend creates a short-lived httpOnly `resetPasswordToken`.
- Reset password requires that token before changing the password.
- Reset token expires in 10 minutes.
- Reset token is cleared after successful password reset.
- Backend validates password strength before updating password.

## Salons Page

Updated:

- `Scissors_frontend/src/Pages/User/Salons.tsx`

Improvements:

- Professional redesign.
- Better listing layout.
- Responsive grid.
- Mobile-friendly filter and sort behavior.
- Flipkart-style mobile filter/sort controls.
- Sticky mobile control bar.
- Bottom-sheet style filter behavior.

## Razorpay Network Calls

Issue:

Many Razorpay scripts were appearing in the browser network tab even when payment was not being used.

Cause:

The Razorpay checkout script was globally loaded from `Scissors_frontend/index.html`.

Fix:

Removed the global Razorpay script from:

- `Scissors_frontend/index.html`

This prevents Razorpay chunks from loading on unrelated pages.

## Verification Completed

The following checks were run repeatedly after major changes:

- Frontend TypeScript check passed.
- Backend TypeScript check passed.
- Frontend Vite production build passed.

Known existing warnings:

- Large frontend bundle warning.
- `@zegocloud/zego-uikit-prebuilt` uses `eval`.
- Browserslist database is outdated.

These warnings are existing project-level concerns and are not caused by the recent auth or forgot-password work.

## Pending Cleanup

Important remaining work:

- Continue typing cleanup.
- Reduce `any` usage.
- Move remaining old `src/Components` files into `src/shared` or `src/features`.
- Move remaining domain-specific page logic from `src/Pages` into `src/features`.
- Keep `src/Pages` mostly as route wrappers.
- Clean admin and salon API interceptors.
- Remove debug logs from backend controllers.
- Add backend auth/cookie helper utilities to reduce duplication.
- Consider code-splitting large frontend chunks.
- Decide whether generated `dist/` files should be ignored or removed from tracking.

## Current Status

The project is not fully refactored yet, but the architecture direction is now established.

Completed areas are cleaner, safer, and more consistent:

- Sign in
- Sign up
- Signup OTP verification
- Forgot password
- Reset password
- JWT refresh behavior
- Firebase missing credential behavior
- Local MongoDB setup
- Salons listing mobile design

