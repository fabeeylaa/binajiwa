import pool from '../config/db.js';

// Hasil screening adalah data kesehatan mental yang sensitif. Secara default
// identitas user DISAMARKAN di panel admin. Set ADMIN_SHOW_FULL_IDENTITY=true
// di .env kalau memang ada dasar persetujuan/kebutuhan menghubungi user.
const SHOW_FULL = process.env.ADMIN_SHOW_FULL_IDENTITY === 'true';

const maskName = (name) => {
  const n = String(name || '').trim();
  if (!n) return 'Pengguna';
  return n.split(/\s+/).map((w) => w.slice(0, 1) + '*'.repeat(Math.max(1, Math.min(w.length - 1, 4)))).join(' ');
};

const maskEmail = (email) => {
  const [local = '', domain = ''] = String(email || '').split('@');
  if (!domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
};

export const getAdminStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int FROM users');
    // User aktif = mencatat habit atau mengisi screening dalam 7 hari terakhir
    // (dulu salah dihitung sebagai "user yang mendaftar 7 hari terakhir").
    const activeUsers = await pool.query(`
      SELECT COUNT(DISTINCT user_id)::int FROM (
        SELECT user_id FROM habit_logs WHERE log_date >= CURRENT_DATE - 6
        UNION
        SELECT user_id FROM assessment_results WHERE created_at >= NOW() - INTERVAL '7 days'
      ) t
    `);
    const articlesCount = await pool.query('SELECT COUNT(*)::int FROM articles');
    const assessmentsCount = await pool.query('SELECT COUNT(*)::int FROM assessment_results');
    const habitsCount = await pool.query('SELECT COUNT(*)::int FROM habits');
    const completedHabits = await pool.query('SELECT COUNT(*)::int FROM habit_logs');

    // Tren pendaftaran 14 hari (hari tanpa pendaftar diisi 0), terbaru lebih dulu.
    // 14 hari dibutuhkan agar minggu ini bisa dibandingkan dengan minggu lalu;
    // sebelumnya hanya 7 hari dan hanya hari yang ada pendaftarnya, sehingga
    // persentase tren selalu 0% dan grafik hanya berisi titik-titik terputus.
    const userTrend = await pool.query(`
      SELECT d::date AS date, COUNT(u.id)::int AS count
      FROM generate_series(CURRENT_DATE - 13, CURRENT_DATE, '1 day') d
      LEFT JOIN users u ON DATE(u.created_at) = d::date
      GROUP BY d::date
      ORDER BY d::date DESC
    `);

    // Jumlah centang habit 7 hari terakhir (dipakai untuk tingkat pencatatan).
    const habitLogs7d = await pool.query(
      `SELECT COUNT(*)::int FROM habit_logs WHERE log_date >= CURRENT_DATE - 6`
    );

    // Distribusi hasil assessment per kategori
    const assessmentStats = await pool.query(`
      SELECT category_label, COUNT(*)::int as count
      FROM assessment_results
      GROUP BY category_label
      ORDER BY count DESC
    `);

    res.status(200).json({
      stats: {
        users: usersCount.rows[0].count,
        activeUsers: activeUsers.rows[0].count,
        articles: articlesCount.rows[0].count,
        assessments: assessmentsCount.rows[0].count,
        habits: habitsCount.rows[0].count,
        completedHabits: completedHabits.rows[0].count,
        habitLogs7d: habitLogs7d.rows[0].count,
        userTrend: userTrend.rows,
        assessmentStats: assessmentStats.rows,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil statistik admin' });
  }
};

export const getAllAssessmentResults = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.total_score, r.category_label, r.flagged, r.created_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email,
             a.title AS assessment_title, a.code AS assessment_code,
             (SELECT MAX(sr.max_score) FROM assessment_score_ranges sr
               WHERE sr.assessment_id = r.assessment_id) AS max_score
      FROM assessment_results r
      JOIN users u ON u.id = r.user_id
      JOIN assessments a ON a.id = r.assessment_id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);
    const results = result.rows.map(({ user_id, ...r }) => ({
      ...r,
      user_ref: `U-${String(user_id).padStart(4, '0')}`,
      user_name: SHOW_FULL ? r.user_name : maskName(r.user_name),
      user_email: SHOW_FULL ? r.user_email : maskEmail(r.user_email),
    }));
    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil semua hasil assessment' });
  }
}; 