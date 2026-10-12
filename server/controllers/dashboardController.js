import pool from "../config/db.js";
import { calculateStreak } from "../utils/streak.js";

const STREAK_TARGET = Number(process.env.STREAK_TARGET) || 1;

const calcStreaks = (dayNums, todayNum) => {
  if (!dayNums || dayNums.length === 0) {
    return { streak: 0, longest_streak: 0 };
  }
  const daySet = new Set(dayNums);
  let cursor = daySet.has(todayNum) ? todayNum : todayNum - 1;
  let streak = 0;
  while (daySet.has(cursor)) {
    streak++;
    cursor--;
  }
  const sorted = [...dayNums].sort((a, b) => a - b);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return { streak, longest_streak: longest };
};

export const getDashboardSummary = async (req, res) => {
  const uid = req.user.id;
  try {
    const [habitsRes, weeklyRes, screeningRes, leaderboardRes, articlesRes] = await Promise.all([
      // Habits with streak
      pool.query(
        `SELECT h.id, h.user_id, h.title, h.description, h.frequency, h.target_count, h.created_at,
                EXISTS(SELECT 1 FROM habit_logs WHERE habit_id = h.id AND user_id = $1 AND log_date = CURRENT_DATE) as logged_today
         FROM habits h
         WHERE h.user_id = $1
         ORDER BY h.created_at DESC`,
        [uid]
      ),
      // Weekly stats
      pool.query(
        `SELECT d::date AS date, COUNT(DISTINCT hl.habit_id)::int AS count
         FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day') d
         LEFT JOIN habit_logs hl ON hl.user_id = $1 AND hl.log_date = d::date
         GROUP BY d::date
         ORDER BY d::date ASC`,
        [uid]
      ),
      // Latest screening
      pool.query(
        `SELECT r.id, r.total_score, r.category_label, r.result_message, r.flagged, r.created_at,
                a.title AS assessment_title, a.code AS assessment_code,
                (SELECT MAX(sr.max_score) FROM assessment_score_ranges sr
                  WHERE sr.assessment_id = r.assessment_id) AS max_score
         FROM assessment_results r
         JOIN assessments a ON a.id = r.assessment_id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC
         LIMIT 1`,
        [uid]
      ),
      // Leaderboard rank for user (friends + global)
      pool.query(
        `SELECT u.id, u.name, u.username, u.avatar_url,
                COUNT(DISTINCT hl.habit_id)::int AS total_completed,
                ARRAY_AGG(DISTINCT hl.log_date) AS log_dates
         FROM users u
         LEFT JOIN habit_logs hl ON hl.user_id = u.id
         GROUP BY u.id
         ORDER BY u.id`,
        []
      ),
      // Latest articles (3)
      pool.query(
        `SELECT id, title, slug, category, excerpt, cover_image, created_at
         FROM articles
         ORDER BY created_at DESC
         LIMIT 3`
      ),
    ]);

    // Calculate habit data
    const habitLogsRes = await pool.query(
      `SELECT habit_id,
              (log_date - DATE '2000-01-01') AS day_num,
              (CURRENT_DATE - DATE '2000-01-01') AS today_num
       FROM habit_logs
       WHERE user_id = $1`,
      [uid]
    );
    const todayNum = habitLogsRes.rows.length > 0 ? Number(habitLogsRes.rows[0].today_num) : 0;
    const daysByHabit = {};
    for (const row of habitLogsRes.rows) {
      (daysByHabit[row.habit_id] ||= []).push(Number(row.day_num));
    }

    const habits = habitsRes.rows.map((habit) => {
      const { streak } = calcStreaks(daysByHabit[habit.id], todayNum);
      return {
        ...habit,
        streak,
        streak_active: streak >= STREAK_TARGET,
      };
    });

    const totalHabits = habits.length;
    const doneHabits = habits.filter((h) => h.logged_today).length;
    const progressPct = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;

    // Calculate streak for user
    const myStreakData = habits.length > 0
      ? Math.max(...habits.map((h) => h.streak || 0))
      : 0;

    // Weekly chart
    const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const weekly = weeklyRes.rows.map((r) => ({
      day: daysOfWeek[new Date(r.date + "T00:00:00Z").getUTCDay()],
      date: r.date,
      value: r.count,
    }));

    // Latest screening
    const lastScreening = screeningRes.rows[0] || null;

    // Leaderboard rank (compute streak for all, sort)
    const leaderboard = leaderboardRes.rows
      .map((u) => {
        const streak = u.log_dates ? calculateStreak(u.log_dates) : 0;
        return {
          user_id: u.id,
          name: u.name,
          username: u.username,
          avatar_url: u.avatar_url,
          current_streak: streak,
          total_habits_completed: u.total_completed || 0,
          is_me: u.id === uid,
        };
      })
      .sort(
        (a, b) =>
          b.current_streak - a.current_streak ||
          b.total_habits_completed - a.total_habits_completed
      );

    leaderboard.forEach((row, index) => {
      row.rank_position = index + 1;
    });

    const meRank = leaderboard.find((r) => r.is_me) || { rank_position: null, current_streak: myStreakData };

    // Health score calculation
    const streakBonus = Math.min(meRank.current_streak * 2, 20);
    const screeningBonus = lastScreening ? 10 : 0;
    const healthScore = Math.min(100, Math.round(progressPct * 0.6 + streakBonus + screeningBonus + 15));

    const habitsList = habits.slice(0, 4).map(h => ({
      id: h.id,
      title: h.title,
      logged_today: h.logged_today,
      streak: h.streak,
      streak_active: h.streak_active,
    }));

    res.status(200).json({
      habits: {
        total: totalHabits,
        done: doneHabits,
        progressPct,
        streak: meRank.current_streak,
        streak_target: STREAK_TARGET,
        streak_active: meRank.current_streak >= STREAK_TARGET,
        habitsList,
      },
      weekly,
      lastScreening,
      meRank,
      latestArticles: articlesRes.rows,
      healthScore,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};