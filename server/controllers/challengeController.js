import pool from "../config/db.js";

// Satu query untuk semua data challenge + progres milik user yang sedang login.
const CHALLENGE_SELECT = `
  SELECT
    c.*,
    (SELECT COUNT(*) FROM challenge_participants cp
       WHERE cp.challenge_id = c.id)::INT AS participant_count,
    EXISTS(SELECT 1 FROM challenge_participants cp
       WHERE cp.challenge_id = c.id AND cp.user_id = $1) AS is_joined,
    (SELECT COUNT(*) FROM challenge_checkins ck
       WHERE ck.challenge_id = c.id AND ck.user_id = $1)::INT AS my_checkins,
    EXISTS(SELECT 1 FROM challenge_checkins ck
       WHERE ck.challenge_id = c.id AND ck.user_id = $1
         AND ck.checkin_date = CURRENT_DATE) AS checked_today,
    j.joined_date AS my_joined_date,
    -- Deadline PER PESERTA: tanggal ikut + durasi. Peserta yang ikut terlambat
    -- tetap punya waktu penuh (dulu semua orang memakai end_date challenge,
    -- sehingga yang ikut terlambat mustahil menyelesaikannya).
    -- Untuk yang belum ikut, end_date challenge = batas pendaftaran.
    CASE WHEN j.joined_date IS NOT NULL
         THEN (j.joined_date + c.duration_days) - CURRENT_DATE
         WHEN c.end_date IS NOT NULL
         THEN c.end_date::date - CURRENT_DATE
         ELSE NULL END::INT AS days_left,
    CASE WHEN j.joined_date IS NOT NULL
         THEN CURRENT_DATE > j.joined_date + c.duration_days
         ELSE (c.end_date IS NOT NULL AND c.end_date::date < CURRENT_DATE)
    END AS is_ended
  FROM challenges c
  LEFT JOIN LATERAL (
    SELECT cp.joined_at::date AS joined_date
    FROM challenge_participants cp
    WHERE cp.challenge_id = c.id AND cp.user_id = $1
  ) j ON TRUE
`;

const withStatus = (row) => {
  const target = row.duration_days || 0;
  const done = Math.min(row.my_checkins ?? 0, target);
  const is_completed = target > 0 && done >= target;
  return {
    ...row,
    my_checkins: done,
    is_completed,
    // 'completed' | 'in_progress' | 'failed' | null (belum ikut)
    my_status: !row.is_joined
      ? null
      : is_completed
        ? "completed"
        : row.is_ended
          ? "failed"
          : "in_progress",
  };
};

export const createChallenge = async (req, res) => {
  const { title, description, habit_type, duration_days, max_participants } = req.body;
  const userId = req.user.id;

  const duration = parseInt(duration_days, 10);
  const maxP = max_participants ? parseInt(max_participants, 10) : null;

  if (!title || !String(title).trim() || !habit_type || !duration_days) {
    return res.status(400).json({ message: 'Title, habit_type, dan duration_days wajib diisi' });
  }
  if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
    return res.status(400).json({ message: 'Durasi harus 1-365 hari' });
  }
  if (maxP !== null && (!Number.isInteger(maxP) || maxP < 1)) {
    return res.status(400).json({ message: 'Maksimal peserta harus angka positif' });
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + duration);

  try {
    const result = await pool.query(
      `INSERT INTO challenges (title, description, habit_type, duration_days, max_participants, end_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [String(title).trim(), description || null, habit_type, duration, maxP, endDate, userId]
    );

    const challenge = result.rows[0];

    await pool.query(
      'INSERT INTO challenge_participants (challenge_id, user_id) VALUES ($1, $2)',
      [challenge.id, userId]
    );

    res.status(201).json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

export const getChallenges = async (req, res) => {
  try {
    const result = await pool.query(
      `${CHALLENGE_SELECT} ORDER BY c.created_at DESC`,
      [req.user.id],
    );
    res.status(200).json(result.rows.map(withStatus));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const joinChallenge = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const challenge = await pool.query('SELECT * FROM challenges WHERE id = $1', [id]);

    if (challenge.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge tidak ditemukan' });
    }

    const c = challenge.rows[0];

    const closed = await pool.query(
      'SELECT (end_date IS NOT NULL AND end_date::date < CURRENT_DATE) AS closed FROM challenges WHERE id = $1',
      [id]
    );
    if (closed.rows[0].closed) {
      return res.status(400).json({ message: 'Pendaftaran challenge sudah ditutup' });
    }

    if (c.max_participants) {
      const countResult = await pool.query(
        'SELECT COUNT(*)::INT AS count FROM challenge_participants WHERE challenge_id = $1',
        [id]
      );
      if (countResult.rows[0].count >= c.max_participants) {
        return res.status(400).json({ message: 'Challenge sudah penuh' });
      }
    }

    const result = await pool.query(
      'INSERT INTO challenge_participants (challenge_id, user_id) VALUES ($1, $2) RETURNING *',
      [id, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Kamu sudah join challenge ini' });
    }
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Ambil satu challenge lengkap dengan status milik user (untuk respons check-in).
const fetchOne = async (challengeId, userId) => {
  const r = await pool.query(`${CHALLENGE_SELECT} WHERE c.id = $2`, [userId, challengeId]);
  return r.rows[0] ? withStatus(r.rows[0]) : null;
};

// Check-in hari ini. Tanggal diambil dari database (CURRENT_DATE) agar
// konsisten dengan habit_logs dan tidak meleset karena zona waktu server.
export const checkinChallenge = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const current = await fetchOne(id, userId);
    if (!current) return res.status(404).json({ message: 'Challenge tidak ditemukan' });
    if (!current.is_joined) {
      return res.status(403).json({ message: 'Ikut challenge dulu sebelum check-in' });
    }
    if (current.is_completed) {
      return res.status(400).json({ message: 'Challenge ini sudah kamu selesaikan' });
    }
    if (current.is_ended) {
      return res.status(400).json({ message: 'Challenge sudah berakhir' });
    }

    await pool.query(
      `INSERT INTO challenge_checkins (challenge_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (challenge_id, user_id, checkin_date) DO NOTHING`,
      [id, userId]
    );

    res.status(201).json(await fetchOne(id, userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Batalkan check-in hari ini (salah klik). Challenge yang sudah selesai dikunci.
export const undoCheckinChallenge = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const current = await fetchOne(id, userId);
    if (!current) return res.status(404).json({ message: 'Challenge tidak ditemukan' });
    if (!current.is_joined) {
      return res.status(403).json({ message: 'Kamu belum ikut challenge ini' });
    }
    if (current.is_completed) {
      return res.status(400).json({ message: 'Challenge yang sudah selesai tidak bisa dibatalkan' });
    }

    await pool.query(
      `DELETE FROM challenge_checkins
       WHERE challenge_id = $1 AND user_id = $2 AND checkin_date = CURRENT_DATE`,
      [id, userId]
    );

    res.status(200).json(await fetchOne(id, userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
