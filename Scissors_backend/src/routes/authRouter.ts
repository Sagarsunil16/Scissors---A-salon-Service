import { Router } from "express";
import AuthController from "../controllers/AuthController";

const authRouter = Router();

// Public route
authRouter.post('/refresh-token', AuthController.refreshToken);

export default authRouter;