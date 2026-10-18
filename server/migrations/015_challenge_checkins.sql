-- 015_challenge_checkins.sql
-- Pelacakan progres challenge: satu baris = satu hari check-in oleh satu peserta.
-- Challenge dianggap selesai kalau jumlah check-in >= duration_days.
-- Aman dijalankan berulang kali.
CREATE TABLE IF NOT EXISTS challenge_checkins (
  id SERIAL PRIMARY KEY,
  challenge_id INT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (challenge_id, user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_challenge_checkins_user
  ON challenge_checkins (user_id, challenge_id);
