import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import pool from './config/db.js';
import { setSocketIo } from './services/notificationService.js';

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
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diisi di server/.env, server dihentikan.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  },
});

setSocketIo(io);

// Autentikasi Socket.IO menggunakan cookie token
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) return next(new Error('Authentication error'));
    
    // Parse cookie manual
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );

    const token = cookies.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  if (userId) {
    socket.join(`user:${userId}`);
  }
});

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
app.use("/api/notifications", notificationRoutes);

app.get('/', (req, res) => {
  res.send('BinaJiwa API is running');
});

// Error handler
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File terlalu besar, maksimal 10MB' });
  }
  if (err && err.message === 'Hanya file gambar yang diperbolehkan') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
