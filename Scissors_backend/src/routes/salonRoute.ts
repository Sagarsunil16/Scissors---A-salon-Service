import { Router } from "express";
import SalonController from "../controllers/SalonController";

import verifyToken from "../middleware/verifyToken";
import upload from "../config/multer";
import ServiceController from "../controllers/ServiceController";
import StylistController from "../controllers/StylistController";
const router =  Router()

router.post('/Register',SalonController.createSalon)
router.post('/otp',SalonController.sentOtp)
router.put('/verify',SalonController.verifyOtAndUpdate)
router.post('/resent-otp',SalonController.sentOtp)
router.post('/login',SalonController.loginSalon)
router.post('/signout',SalonController.signOutSalon)
router.post('/upload-image',upload.single("image"),SalonController.uploadImage)
router.put('/delete-image',SalonController.deleteImage)
router.get('/salon-service',SalonController.getSalonData)
router.get('/service',ServiceController.getAllServices)
router.put('/add-service',SalonController.addService)
router.put('/edit-service',SalonController.updateService)
router.post('/add-stylist',StylistController.createStylist)
router.get('/stylist',StylistController.getStylistbySalonId)
//Protected route
router.put("/profile",verifyToken,SalonController.updateSalon)

export default router