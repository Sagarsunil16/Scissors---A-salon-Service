import { Router } from "express";
import AuthController from "../controllers/AuthController";
const router = Router()


router.post('/refresh-token',AuthController.refreshToken)

export default router