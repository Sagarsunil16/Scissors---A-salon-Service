import { Router } from "express";
import AdminController from "../controllers/AdminController";

const router = Router()

router.post('/login',AdminController.adminLogin)
router.post('/signout',AdminController.signOut)

export default router