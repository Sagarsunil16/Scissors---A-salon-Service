import { Router } from "express";
import userRouter from "./userRouter";
import adminRouter from "./adminRouter";
import salonRouter from "./salonRouter";
import authRouter from "./authRouter";

const router = Router();

// Use the userRouter with prefix '/'
router.use('/', userRouter);

// Use the adminRouter with prefix '/admin'
router.use('/api/v1/admin', adminRouter);

// Use the salonRouter with prefix '/salon'
router.use('/salon', salonRouter);

// Use the authRouter with prefix '/auth'
router.use('/auth', authRouter);

export default router;