import pool from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int FROM users');
    const activeUsers = await pool.query(`SELECT COUNT(*)::int FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`);
    const articlesCount = await pool.query('SELECT COUNT(*)::int FROM articles');
    const assessmentsCount = await pool.query('SELECT COUNT(*)::int FROM assessment_results');
    const habitsCount = await pool.query('SELECT COUNT(*)::int FROM habits');
    const completedHabits = await pool.query(`SELECT COUNT(*)::int FROM habits WHERE status = 'completed'`);
    
    // Get recent user trend (last 7 days)
    const userTrend = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Get assessment distribution by category
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
             u.name AS user_name, u.email AS user_email,
             a.title AS assessment_title
      FROM assessment_results r
      JOIN users u ON u.id = r.user_id
      JOIN assessments a ON a.id = r.assessment_id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);
    res.status(200).json({ results: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil semua hasil assessment' });
  }
};
