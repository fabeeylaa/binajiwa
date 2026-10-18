import pool from "../config/db.js";
import { calculateStreak } from "../utils/streak.js";

export const addFriend = async (req, res) => {
  const { identifier } = req.body; // bisa email atau username
  const requesterId = req.user.id;

  if (!identifier || !String(identifier).trim()) {
    return res.status(400).json({ message: "Username atau email wajib diisi" });
  }

  try {
    const targetUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $1",
      [String(identifier).trim()],
    );

    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const addresseeId = targetUser.rows[0].id;

    if (addresseeId === requesterId) {
      return res
        .status(400)
        .json({ message: "Tidak bisa menambahkan diri sendiri" });
    }

    // UNIQUE(requester_id, addressee_id) hanya menangkap arah yang sama. Cek dua arah
    // supaya A->B lalu B->A tidak membuat dua baris pertemanan.
    const existing = await pool.query(
      `SELECT * FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)`,
      [requesterId, addresseeId],
    );

    if (existing.rows.length > 0) {
      const f = existing.rows[0];
      if (f.status === "accepted") {
        return res.status(400).json({ message: "Kalian sudah berteman" });
      }
      if (f.status === "pending") {
        return res.status(400).json({
          message:
            f.requester_id === requesterId
              ? "Request pertemanan sudah pernah dikirim"
              : "User ini sudah mengirim request ke kamu, cek Permintaan Masuk",
        });
      }
      // status 'rejected': hapus baris lama supaya request baru bisa dikirim ulang
      await pool.query("DELETE FROM friendships WHERE id = $1", [f.id]);
    }

    const result = await pool.query(
      "INSERT INTO friendships (requester_id, addressee_id) VALUES ($1, $2) RETURNING *",
      [requesterId, addresseeId],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ message: "Request pertemanan sudah pernah dikirim" });
    }
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getFriends = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT
        f.id,
        f.status,
        f.requester_id,
        f.addressee_id,
        CASE WHEN f.requester_id = $1 THEN 'outgoing' ELSE 'incoming' END AS direction,
        u.id AS friend_id,
        u.name,
        u.username,
        u.avatar_url
      FROM friendships f
      JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
      WHERE f.requester_id = $1 OR f.addressee_id = $1
      ORDER BY f.created_at DESC`,
      [userId]
    );

    const friends = result.rows;

    const acceptedFriendIds = friends
      .filter((f) => f.status === "accepted")
      .map((f) => f.friend_id);

    let mutualStreaks = {};

    if (acceptedFriendIds.length > 0) {
      const logsResult = await pool.query(
        `SELECT user_id, ARRAY_AGG(DISTINCT log_date) AS log_dates
         FROM habit_logs
         WHERE user_id = ANY($1)
         GROUP BY user_id`,
        [[userId, ...acceptedFriendIds]]
      );

      const logsByUser = {};
      logsResult.rows.forEach((row) => {
        logsByUser[row.user_id] = row.log_dates.map(
          (d) => new Date(d).toISOString().split("T")[0]
        );
      });

      const myDates = new Set(logsByUser[userId] || []);

      acceptedFriendIds.forEach((friendId) => {
        const friendDates = logsByUser[friendId] || [];
        const overlap = friendDates.filter((d) => myDates.has(d));
        mutualStreaks[friendId] = calculateStreak(overlap);
      });
    }

    const enriched = friends.map((f) => ({
      ...f,
      mutual_streak: f.status === "accepted" ? mutualStreaks[f.friend_id] ?? 0 : null,
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const respondFriend = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'accept' atau 'reject'
  const userId = req.user.id;

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ message: "Action harus accept atau reject" });
  }

  try {
    const friendship = await pool.query(
      "SELECT * FROM friendships WHERE id = $1",
      [id],
    );

    if (friendship.rows.length === 0) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    if (friendship.rows[0].addressee_id !== userId) {
      return res
        .status(403)
        .json({ message: "Kamu tidak berhak merespon request ini" });
    }

    const newStatus = action === "accept" ? "accepted" : "rejected";

    const result = await pool.query(
      "UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [newStatus, id],
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
