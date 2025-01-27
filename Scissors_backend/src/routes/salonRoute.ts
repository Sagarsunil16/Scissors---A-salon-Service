import { Router } from "express";
import SalonController from "../controllers/SalonController";

const router =  Router()

router.post('/Register',SalonController.createSalon)
router.post('/otp',SalonController.sentOtp)
router.put('/verify',SalonController.verifyOtAndUpdate)
router.post('/resent-otp',SalonController.sentOtp)

export default router