import pool from "../config/db.js";
import { calculateStreak } from "../utils/streak.js";

export const getLeaderboard = async (req, res) => {
  const userId = req.user.id;
  const scope = req.query.scope === "friends" ? "friends" : "global";

  try {
    let userFilter = "";
    let params = [];

    if (scope === "friends") {
      const friendsResult = await pool.query(
        `SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END AS friend_id
         FROM friendships
         WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'`,
        [userId],
      );
      const friendIds = friendsResult.rows.map((r) => r.friend_id);
      friendIds.push(userId);
      userFilter = "WHERE u.id = ANY($1)";
      params = [friendIds];
    }

    const usersResult = await pool.query(
      `SELECT u.id, u.name, u.username, u.avatar_url FROM users u ${userFilter} ORDER BY u.id`,
      params,
    );

    const logsResult = await pool.query(
      `SELECT user_id, COUNT(*)::INT AS total_completed, ARRAY_AGG(DISTINCT log_date) AS log_dates
       FROM habit_logs
       GROUP BY user_id`,
    );

    const logsByUser = {};
    logsResult.rows.forEach((row) => {
      logsByUser[row.user_id] = row;
    });

    const leaderboard = usersResult.rows.map((u) => {
      const logData = logsByUser[u.id];
      const totalCompleted = logData ? logData.total_completed : 0;
      const streak = logData ? calculateStreak(logData.log_dates) : 0;

      return {
        user_id: u.id,
        name: u.name,
        username: u.username,
        avatar_url: u.avatar_url,
        current_streak: streak,
        total_habits_completed: totalCompleted,
        is_me: u.id === userId,
      };
    });

    leaderboard.sort(
      (a, b) =>
        b.current_streak - a.current_streak ||
        b.total_habits_completed - a.total_habits_completed,
    );

    leaderboard.forEach((row, index) => {
      row.rank_position = index + 1;
    });

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
