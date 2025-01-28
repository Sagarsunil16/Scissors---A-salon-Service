import { Router } from "express";
import UserController from "../controllers/UserController";

import verifyToken from "../middleware/verifyToken";
const router = Router()

router.post('/signup',UserController.createUser)
router.post('/login',UserController.userLogin)
router.post('/signout',UserController.userSignOut)
router.post('/forgot-password',UserController.sentOtp)
router.put('/resend-otp',UserController.sentOtp)
router.post('/verify-otp',UserController.verifyOtp)
router.put('/reset-password',UserController.resetPassword)


// Protected routes
router.put('/profile',verifyToken,UserController.updateUser)
router.put('/change-password',verifyToken,UserController.changePassword)

export default router