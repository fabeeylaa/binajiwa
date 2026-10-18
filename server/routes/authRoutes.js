import express from 'express';
import { register, login, getMe, logout, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';
import { rateLimit } from '../middleware/rateLimit.js';

// Gagal login/register dibatasi per IP. Bisa diatur lewat .env.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_MAX_ATTEMPTS) || 10,
  message: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.',
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.REGISTER_MAX_ATTEMPTS) || 10,
  message: 'Terlalu banyak percobaan pendaftaran. Coba lagi nanti.',
});

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.post('/logout', logout);

export default router;