import express from "express";
import {
  getNotifications,
  readNotifications,
  deleteNotification,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/read", verifyToken, readNotifications);
router.put("/read/:id", verifyToken, readNotifications);
router.delete("/:id", verifyToken, deleteNotification);

export default router;
