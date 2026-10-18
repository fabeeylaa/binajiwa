import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";

// Cookie hanya dikirim lewat HTTPS saat NODE_ENV=production (di lokal tetap HTTP).
// Opsi yang sama dipakai saat set & hapus cookie supaya logout benar-benar menghapusnya.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

export const register = async (req, res) => {
  const { password, consent } = req.body ?? {};
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const username = String(req.body?.username ?? '').trim();

  if (!name) {
    return res.status(400).json({ message: 'Nama wajib diisi' });
  }
  if (!username) {
    return res.status(400).json({ message: 'Username wajib diisi' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({
      message: 'Username harus 3-20 karakter (huruf, angka, underscore)',
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter' });
  }
  // Persetujuan dicek di server (bukan hanya di checkbox), waktunya disimpan.
  if (consent !== true) {
    return res.status(400).json({
      message: 'Kamu harus menyetujui ketentuan penggunaan data untuk mendaftar',
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email atau username sudah dipakai' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, username, password, consent_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, username, role',
      [name, email, username, hashedPassword]
    );

    res.status(201).json({ message: 'Registrasi berhasil', user: newUser.rows[0] });
  } catch (err) {
    if (err.code === '42703') {
      // kolom consent_at belum ada -> migrasi 016 belum dijalankan
      console.error('Jalankan migrasi 016_add_consent_to_users.sql dulu.', err.message);
      return res.status(500).json({
        message: 'Database belum diperbarui. Jalankan migrasi 016_add_consent_to_users.sql.',
      });
    }
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, username, avatar_url, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logout berhasil' });
};

export const updateProfile = async (req, res) => {
  const { name, username } = req.body;
  const avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const userId = req.user.id;

  try {
    const userResult = await pool.query(
      'SELECT name, username, avatar_url FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const newName = name?.trim() || userResult.rows[0].name;
    const newUsername = username?.trim() || userResult.rows[0].username;

    if (newUsername !== userResult.rows[0].username) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
        return res.status(400).json({
          message: 'Username harus 3-20 karakter (huruf, angka, underscore)',
        });
      }
      const duplicate = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [newUsername, userId]
      );
      if (duplicate.rows.length > 0) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ message: 'Username sudah dipakai' });
      }
    }

    const newAvatarUrl = avatarUrl || userResult.rows[0].avatar_url;
    
    // Hapus file avatar lama jika ada yang baru
    if (avatarUrl && userResult.rows[0].avatar_url) {
        const oldFile = path.join('uploads', path.basename(userResult.rows[0].avatar_url));
        await fs.unlink(oldFile).catch(() => {});
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, username = $2, avatar_url = $3 WHERE id = $4 RETURNING id, name, email, username, avatar_url, role',
      [newName, newUsername, newAvatarUrl, userId]
    );

    res.status(200).json({ message: 'Profil berhasil diupdate', user: result.rows[0] });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};