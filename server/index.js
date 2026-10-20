import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diisi di server/.env, server dihentikan.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Wajib di belakang proxy Render supaya cookie `secure` terkirim
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded avatar files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/social/friends', friendRoutes);
app.use('/api/social/challenges', challengeRoutes);
app.use("/api/social/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get('/', (req, res) => {
  res.send('SehatJiwa API is running');
});

// Error handler HARUS didaftarkan setelah semua route, kalau tidak error dari
// multer (file terlalu besar / bukan gambar) tidak pernah sampai ke sini.
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File terlalu besar, maksimal 10MB' });
  }
  if (err && err.message === 'Hanya file gambar yang diperbolehkan') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});