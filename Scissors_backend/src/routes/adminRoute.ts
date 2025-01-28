import { Router } from "express";
import AdminController from "../controllers/AdminController";
import verifyToken from "../middleware/verifyToken";
const router = Router()

router.post('/login',AdminController.adminLogin)
router.post('/signout',AdminController.signOut)
router.put('/block-unblock',verifyToken,AdminController.blockUnblockUser)
router.post('/delete-user',verifyToken,AdminController.deleteUser)
export default router