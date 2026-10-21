import express from "express";
import {
  addFriend,
  getFriends,
  respondFriend,
  deleteFriend,
} from "../controllers/friendController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addFriend);
router.get("/", verifyToken, getFriends);
router.put("/:id/respond", verifyToken, respondFriend);
router.delete("/:id", verifyToken, deleteFriend);

export default router;
