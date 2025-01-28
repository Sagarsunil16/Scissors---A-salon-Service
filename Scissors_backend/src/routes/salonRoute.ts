import { Router } from "express";
import SalonController from "../controllers/SalonController";
import verifyToken from "../middleware/verifyToken";
const router =  Router()

router.post('/Register',SalonController.createSalon)
router.post('/otp',SalonController.sentOtp)
router.put('/verify',SalonController.verifyOtAndUpdate)
router.post('/resent-otp',SalonController.sentOtp)
router.post('/login',SalonController.loginSalon)
router.post('/signout',SalonController.signOutSalon)

//Protected route
router.put("/profile",verifyToken,SalonController.updateSalon)

export default router