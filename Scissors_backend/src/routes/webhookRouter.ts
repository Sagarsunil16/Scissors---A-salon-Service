import { Router } from "express";
import express from "express";
import { bookingController } from "../container/di";

const router = Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }), 
  bookingController.webHooks.bind(bookingController)
);

export default router;
