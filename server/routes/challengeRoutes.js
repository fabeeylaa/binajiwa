import express from "express";
import {
  createChallenge,
  getChallenges,
  joinChallenge,
  checkinChallenge,
  undoCheckinChallenge,
} from "../controllers/challengeController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createChallenge);
router.get("/", verifyToken, getChallenges);
router.post("/:id/join", verifyToken, joinChallenge);
router.post("/:id/checkin", verifyToken, checkinChallenge);
router.delete("/:id/checkin", verifyToken, undoCheckinChallenge);

export default router;
