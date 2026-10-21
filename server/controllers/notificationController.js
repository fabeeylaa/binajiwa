import pool from "../config/db.js";

// Ambil riwayat notif milik user, lengkap dengan data actor.
export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT
        n.*,
        u.name AS actor_name,
        u.username AS actor_username,
        u.avatar_url AS actor_avatar
      FROM notifications n
      LEFT JOIN users u ON u.id = n.actor_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 100`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Tandai satu atau semua notif sebagai terbaca.
export const readNotifications = async (req, res) => {
  const { id } = req.params; // jika ada id tertentu
  const userId = req.user.id;

  try {
    if (id) {
      await pool.query(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
    } else {
      await pool.query(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
        [userId]
      );
    }
    res.status(200).json({ message: "Berhasil ditandai baca" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Hapus notif tertentu.
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    res.status(200).json({ message: "Notifikasi dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
