import { Router } from "express";
import { authController } from "../container/di";


const authRouter = Router();

// Public route
authRouter.post('/refresh-token', authController.refreshToken.bind(authController));

export default authRouter;