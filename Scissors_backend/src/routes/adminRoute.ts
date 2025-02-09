import { Router } from "express";
import AdminController from "../controllers/AdminController";
import verifyToken from "../middleware/verifyToken";
const router = Router()

router.post('/login',AdminController.adminLogin)
router.post('/signout',AdminController.signOut)
router.put('/block-unblock',verifyToken,AdminController.blockUnblockUser)
router.post('/delete-user',verifyToken,AdminController.deleteUser)
router.post('/users',AdminController.getUsers)
router.post('/salons',AdminController.getSalons)
router.put('/salon/block-unblock',AdminController.blockAndUnblockSalon)
router.post('/totalPages',AdminController.getTotalPages)
router.put('/profile',AdminController.updateProfile)
router.put('/change-password',AdminController.changePassword)
export default router