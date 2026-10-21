import pool from "../config/db.js";

// Modul ini pusat pembuatan notifikasi. Controller cukup memanggil
// createNotification / createNotifications dan notifikasi langsung
// disimpan ke tabel + diemit lewat Socket.IO ke user yang menerima.

// io di-set dari index.js saat server berjalan.
let io = null;
export const setSocketIo = (socketIo) => {
  io = socketIo;
};

const roomOf = (userId) => `user:${userId}`;

// Kirim event ke satu user (kalau sedang online).
const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(roomOf(userId)).emit(event, payload);
};

const actorSelect = `
  SELECT id, name, username, avatar_url FROM users WHERE id = $1
`;

// Buat satu notifikasi untuk satu user.
// type: 'friend_request' | 'challenge_checkin' | ...
// data: objek bebas (challenge id, friendship id, dll.) disimpan sebagai JSONB.
export const createNotification = async ({
  userId,
  actorId = null,
  type,
  title = null,
  message,
  link = null,
  data = null,
  emit = true,
}) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, actor_id, type, title, message, link, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, actorId, type, title, message, link, data ? JSON.stringify(data) : null]
  );
  const notification = result.rows[0];

  if (emit && actorId) {
    const actor = await pool.query(actorSelect, [actorId]);
    emitToUser(userId, "notification:new", {
      ...notification,
      actor: actor.rows[0] || null,
    });
  }

  return notification;
};

// Buat notifikasi yang sama untuk banyak user sekaligus (1 query insert).
// recipients: array user id. emit tetap per-user lewat Socket.IO.
export const createNotificationsForMany = async ({
  userIds,
  actorId = null,
  type,
  title = null,
  message,
  link = null,
  data = null,
  emit = true,
}) => {
  if (!userIds || userIds.length === 0) return [];

  const values = userIds.map((_, i) => {
    const base = i * 7;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
  });

  const params = userIds.flatMap((uid) => [
    uid,
    actorId,
    type,
    title,
    message,
    link,
    data ? JSON.stringify(data) : null,
  ]);

  const result = await pool.query(
    `INSERT INTO notifications (user_id, actor_id, type, title, message, link, data)
     VALUES ${values.join(", ")}
     RETURNING *`,
    params
  );

  if (emit && actorId) {
    const actor = await pool.query(actorSelect, [actorId]);
    const actorRow = actor.rows[0] || null;
    userIds.forEach((uid, i) => {
      emitToUser(uid, "notification:new", {
        ...result.rows[i],
        actor: actorRow,
      });
    });
  }

  return result.rows;
};
